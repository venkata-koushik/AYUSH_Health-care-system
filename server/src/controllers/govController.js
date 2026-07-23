import jwt from "jsonwebtoken";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import EHR from "../models/ehrModel.js";
import groqClient from "../config/groqClient.js";

const DEFAULT_CATEGORIES = [
  "Respiratory",
  "Gastrointestinal",
  "Musculoskeletal",
  "Neurological",
  "Dermatological",
  "Cardiovascular",
  "Endocrine",
  "Genitourinary",
  "ENT",
  "Ophthalmic",
  "Mental Health",
  "General / Other",
];

const PERIOD_DAYS = { "7d": 7, "30d": 30, "365d": 365 };

const startForPeriod = (period) => {
  const days = PERIOD_DAYS[period];
  if (!days) return null;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const key = (value) => String(value || "Not recorded").trim() || "Not recorded";
const addCount = (counts, label) => {
  counts[label] = (counts[label] || 0) + 1;
};
const toRows = (counts, limit) =>
  Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);

const patientAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  )
    age -= 1;
  return age >= 0 && age < 130 ? age : null;
};

const ageBucket = (age) => {
  if (age === null) return "Not recorded";
  if (age <= 18) return "0–18";
  if (age <= 35) return "19–35";
  if (age <= 50) return "36–50";
  if (age <= 65) return "51–65";
  return "65+";
};

const filterRecords = (records, filters) => {
  const state = normalize(filters.state);
  const district = normalize(filters.district);
  const disease = normalize(filters.disease);
  const periodStart = startForPeriod(filters.period);

  return records.filter((record) => {
    const patient = record.Patient;
    if (!patient) return false;
    if (state && normalize(patient.state) !== state) return false;
    if (district && normalize(patient.district) !== district) return false;
    if (periodStart && new Date(record.createdAt) < periodStart) return false;
    const categories = Array.isArray(record.diagnosisCategories)
      ? record.diagnosisCategories
      : [];
    return (
      !disease || categories.some((category) => normalize(category) === disease)
    );
  });
};

const getAnalytics = async (filters = {}) => {
  const records = await EHR.findAll({
    attributes: [
      "id",
      "patientId",
      "diagnosis",
      "diagnosisCategories",
      "createdAt",
    ],
    include: [
      {
        model: Patient,
        attributes: ["id", "state", "district", "dateOfBirth", "gender"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  const filtered = filterRecords(records, filters);
  const patients = new Map(
    filtered.map((record) => [record.Patient.id, record.Patient]),
  );
  const [totalDoctors, allPatients] = await Promise.all([
    Doctor.count(),
    Patient.findAll({ attributes: ["state", "district"] }),
  ]);

  const diseaseCounts = {};
  const districtCounts = {};
  const stateCounts = {};
  const ageCounts = {
    "0–18": 0,
    "19–35": 0,
    "36–50": 0,
    "51–65": 0,
    "65+": 0,
    "Not recorded": 0,
  };
  const genderCounts = {};
  const monthCounts = {};
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);
  const yearStart = new Date(now);
  yearStart.setDate(now.getDate() - 365);
  let casesThisWeek = 0;
  let casesThisMonth = 0;
  let casesThisYear = 0;

  filtered.forEach((record) => {
    const patient = record.Patient;
    const categories =
      Array.isArray(record.diagnosisCategories) &&
      record.diagnosisCategories.length
        ? record.diagnosisCategories
        : ["Uncategorised"];
    categories.forEach((category) => addCount(diseaseCounts, key(category)));
    addCount(districtCounts, key(patient.district));
    addCount(stateCounts, key(patient.state));
    const recordDate = new Date(record.createdAt);
    if (recordDate >= weekStart) casesThisWeek += 1;
    if (recordDate >= monthStart) casesThisMonth += 1;
    if (recordDate >= yearStart) casesThisYear += 1;
    const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}`;
    addCount(monthCounts, monthKey);
  });

  patients.forEach((patient) => {
    addCount(ageCounts, ageBucket(patientAge(patient.dateOfBirth)));
    addCount(genderCounts, key(patient.gender));
  });

  const trend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: date.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
      value: monthCounts[monthKey] || 0,
    };
  });

  const filterOptions = {};
  allPatients.forEach((patient) => {
    const state = String(patient.state || "").trim();
    const district = String(patient.district || "").trim();
    if (!state) return;
    if (!filterOptions[state]) filterOptions[state] = new Set();
    if (district) filterOptions[state].add(district);
  });

  const topDisease =
    toRows(diseaseCounts, 1)[0]?.label || "No consultation data";
  const topDistrict =
    toRows(districtCounts, 1)[0]?.label || "No consultation data";
  return {
    filters: {
      states: Object.keys(filterOptions).sort(),
      districtsByState: Object.fromEntries(
        Object.entries(filterOptions).map(([state, districts]) => [
          state,
          [...districts].sort(),
        ]),
      ),
      diseases: [
        ...DEFAULT_CATEGORIES,
        ...Object.keys(diseaseCounts).filter(
          (item) =>
            !DEFAULT_CATEGORIES.includes(item) && item !== "Uncategorised",
        ),
      ].filter((item, index, values) => values.indexOf(item) === index),
    },
    summary: {
      totalPatients: patients.size,
      totalDoctors,
      totalConsultations: filtered.length,
      casesThisWeek,
      casesThisMonth,
      casesThisYear,
      topDisease,
      mostAffectedDistrict: topDistrict,
    },
    charts: {
      diseaseDistribution: toRows(diseaseCounts, 6),
      topDiseases: toRows(diseaseCounts, 5),
      monthlyTrend: trend,
      ageDistribution: Object.entries(ageCounts).map(([label, value]) => ({
        label,
        value,
      })),
      genderDistribution: toRows(genderCounts, 6),
    },
    stateIntensity: toRows(stateCounts, 40).map((item) => ({
      state: item.label,
      consultations: item.value,
    })),
    _context: {
      topDisease,
      topDistrict,
      diseaseCounts,
      ageCounts,
      totalConsultations: filtered.length,
    },
  };
};

const createAlerts = (analytics) => {
  const topDiseases = analytics.charts.topDiseases;
  if (!analytics.summary.totalConsultations) {
    return [
      {
        severity: "info",
        title: "No matching consultations",
        detail:
          "Try broadening the selected state, district, disease, or time period.",
      },
    ];
  }
  const alerts = [];
  if (topDiseases[0])
    alerts.push({
      severity: "high",
      title: `${topDiseases[0].label} is the leading category`,
      detail: `${topDiseases[0].value} matching consultations are recorded in the selected view.`,
    });
  if (analytics.summary.mostAffectedDistrict !== "No consultation data")
    alerts.push({
      severity: "medium",
      title: `${analytics.summary.mostAffectedDistrict} needs review`,
      detail:
        "This district currently has the highest consultation volume in the selected view.",
    });
  if (analytics.summary.casesThisWeek)
    alerts.push({
      severity: "info",
      title: "Recent healthcare activity",
      detail: `${analytics.summary.casesThisWeek} consultation${analytics.summary.casesThisWeek === 1 ? "" : "s"} recorded in the last seven days.`,
    });
  return alerts;
};

export const govLogin = async (req, res) => {
  const { username, password } = req.body;
  if (
    username !== process.env.GOV_USERNAME ||
    password !== process.env.GOV_PASSWORD
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  const token = jwt.sign({ role: "government" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .json({ success: true, message: "Government login successful", token });
};

export const govDashboard = async (req, res) => {
  try {
    const analytics = await getAnalytics(req.query);
    return res
      .status(200)
      .json({ success: true, ...analytics, alerts: createAlerts(analytics) });
  } catch (error) {
    console.error("Government dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load government analytics.",
    });
  }
};

export const govHealthInsight = async (req, res) => {
  try {
    const analytics = await getAnalytics(req.query);
    const safeContext = {
      totalConsultations: analytics.summary.totalConsultations,
      topDisease: analytics.summary.topDisease,
      mostAffectedDistrict: analytics.summary.mostAffectedDistrict,
      topDiseases: analytics.charts.topDiseases,
      ageDistribution: analytics.charts.ageDistribution,
      stateIntensity: analytics.stateIntensity.slice(0, 5),
    };
    const fallback = `The selected view contains ${safeContext.totalConsultations} consultations. ${safeContext.topDisease} is the dominant recorded category, with the highest activity in ${safeContext.mostAffectedDistrict}. Strengthen local awareness, early screening, and referral readiness; validate trends with clinical and surveillance teams before action.`;
    if (!process.env.GROQ_API_KEY)
      return res
        .status(200)
        .json({ success: true, insight: fallback, source: "rule-based" });

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a public-health analytics assistant. Produce one concise, cautious paragraph for government health officials from aggregate statistics only. Do not diagnose individuals, claim causality, invent data, or give emergency instructions. Mention the leading category, affected area, age signal if present, and 2 practical public-health recommendations.",
        },
        {
          role: "user",
          content: JSON.stringify(safeContext),
        },
      ],
    });
    const insight = String(
      completion.choices?.[0]?.message?.content || fallback,
    ).trim();
    return res.status(200).json({
      success: true,
      insight,
      source: "AI-generated from aggregate data",
    });
  } catch (error) {
    console.error("Government insight error:", error.message);
    return res.status(200).json({
      success: true,
      insight:
        "AI insight is temporarily unavailable. Use the current charts and alerts to guide review.",
      source: "unavailable",
    });
  }
};
