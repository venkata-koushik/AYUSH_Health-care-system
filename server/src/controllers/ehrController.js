import EHR from "../models/ehrModel.js";
import Patient from "../models/patientModel.js";

const DIAGNOSIS_CATEGORIES = new Set([
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
]);

const normalizeDiagnosisCategories = (categories) => {
  const values = Array.isArray(categories) ? categories : [];
  return [
    ...new Set(values.filter((category) => DIAGNOSIS_CATEGORIES.has(category))),
  ];
};

export const createEHR = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    const {
      patientId,
      uhid,
      complaint,
      diagnosis,
      diagnosisCategories,
      otherDiagnosisDetails,
      medicines,
      advice,
      manualNotes,
      reportPhoto,
      consultationType,
      followUpDate,
      status,
      doctorSignature,
    } = req.body;

    let resolvedPatientId = patientId;

    if (!resolvedPatientId && uhid) {
      const patient = await Patient.findOne({ where: { uhid } });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found.",
        });
      }
      resolvedPatientId = patient.id;
    }

    if (!resolvedPatientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID or UHID is required.",
      });
    }

    if (!String(complaint || "").trim() || !String(diagnosis || "").trim()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complaint / problem and diagnosis are required.",
        });
    }

    const normalizedCategories =
      normalizeDiagnosisCategories(diagnosisCategories);
    const normalizedOtherDetails = String(otherDiagnosisDetails || "").trim();
    if (
      normalizedCategories.includes("General / Other") &&
      !normalizedOtherDetails
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please describe the Other diagnosis category.",
        });
    }

    const ehr = await EHR.create({
      patientId: resolvedPatientId,
      doctorId,
      complaint,
      diagnosis,
      diagnosisCategories: normalizedCategories,
      otherDiagnosisDetails: normalizedOtherDetails || null,
      medicines,
      advice,
      manualNotes: manualNotes || null,
      reportPhoto: reportPhoto || null,
      consultationType: consultationType || "Offline",
      followUpDate: followUpDate || null,
      status: status || "Open",
      doctorSignature: doctorSignature || doctorId,
    });

    return res.status(201).json({
      success: true,
      message: "Consultation saved successfully.",
      ehr,
    });
  } catch (error) {
    console.error("Create EHR Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientEHR = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await EHR.findAll({
      where: {
        patientId,
      },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get Patient EHR Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching EHR records",
    });
  }
};

export const getSingleEHR = async (req, res) => {
  try {
    const { ehrId } = req.params;

    const ehr = await EHR.findByPk(ehrId);

    if (!ehr) {
      return res.status(404).json({
        success: false,
        message: "EHR not found",
      });
    }

    return res.status(200).json({
      success: true,
      ehr,
    });
  } catch (error) {
    console.error("Get EHR Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching EHR",
    });
  }
};
