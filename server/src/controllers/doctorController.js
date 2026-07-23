import Doctor from "../models/doctorModel.js";
import ApprovedLicense from "../models/approvedLicenseModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/patientModel.js";
import EHR from "../models/ehrModel.js";
import { Op } from "sequelize";
import groqClient from "../config/groqClient.js";

export const registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      governmentLicenseId,
      email,
      phoneNumber,
      address,
      password,
    } = req.body;
    if (
      !fullName ||
      !governmentLicenseId ||
      !email ||
      !phoneNumber ||
      !password
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Full name, license ID, email, phone number, and password are required.",
        });
    }
    const validLicense = await ApprovedLicense.findOne({
      where: { governmentLicenseId },
    });

    if (!validLicense) {
      return res.status(400).json({
        success: false,
        message: "invalid government license id",
      });
    }
    const existingDoctor = await Doctor.findOne({
      where: { [Op.or]: [{ email }, { governmentLicenseId }, { phoneNumber }] },
    });

    if (existingDoctor) {
      const field =
        existingDoctor.email === email
          ? "email"
          : existingDoctor.governmentLicenseId === governmentLicenseId
            ? "government license ID"
            : "phone number";
      return res.status(400).json({
        success: false,
        message: `A doctor already exists with this ${field}.`,
      });
    }
    const hasedpassword = await bcrypt.hash(password, 10);
    const newdoctor = await Doctor.create({
      fullName,
      governmentLicenseId,
      email,
      phoneNumber,
      address,
      password: hasedpassword,
    });
    return res.status(201).json({
      success: true,
      message: "docotor registered successfully",
      doctor: newdoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "invalid email or password",
      });
    }
    const token = jwt.sign(
      { doctorId: doctor.id, email: doctor.email, role: "doctor" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.status(200).json({
      success: true,
      message: "doctor login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutDoctor = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "doctor loggoed out succesfully",
  });
};

export const doctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    const totalConsultation = await EHR.count({
      where: {
        doctorId,
      },
    });
    const recentConsultations = await EHR.findAll({
      where: {
        doctorId,
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      totalConsultation,
      recentConsultations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "dashboard error",
    });
  }
};

export const getPatientHistory = async (req, res) => {
  try {
    const { uhid } = req.params;

    const patient = await Patient.findOne({
      where: {
        uhid,
      },
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    const records = await EHR.findAll({
      where: {
        patientId: patient.id,
      },
      attributes: [
        "complaint",
        "medicines",
        "diagnosis",
        "advice",
        "consultationType",
        "followUpDate",
        "status",
        "doctorSignature",
        "visitDate",
      ],
      include: [
        {
          model: Doctor,
          attributes: ["fullName"],
        },
      ],
      order: [["visitDate", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      patient: {
        uhid: patient.uhid,
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber,
      },
      records,
    });
  } catch (error) {
    console.log("Patient History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching patient history",
    });
  }
};

export const getMyPatients = async (req, res) => {
  try {
    console.log(req.user);
    const doctorId = req.user.doctorId;
    console.log("Doctor ID =", doctorId);
    const records = await EHR.findAll({
      where: {
        doctorId,
      },
      include: [
        {
          model: Patient,
          attributes: ["id", "uhid", "fullName", "phoneNumber", "email"],
        },
      ],
    });
    console.log(records);
    const uniquePatients = [];
    const seen = new Set();
    records.forEach((record) => {
      if (record.Patient && !seen.has(record.Patient.id)) {
        seen.add(record.Patient.id);
        uniquePatients.push(record.Patient);
      }
    });
    return res.status(200).json({
      success: true,
      count: uniquePatients.length,
      patients: uniquePatients,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error featching patients",
    });
  }
};

export const getMyPatientDetails = async (req, res) => {
  try {
    const uhid = req.params.uhid;

    const patient = await Patient.findOne({
      where: {
        uhid,
      },
      attributes: [
        "id",
        "uhid",
        "fullName",
        "dateOfBirth",
        "bloodgroup",
        "allergies",
        "chronicConditions",
        "phoneNumber",
        "email",
        "address",
        "preferredLanguage",
        "state",
        "district",
      ],
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }
    const recentVisits = await EHR.findAll({
      where: {
        patientId: patient.id,
      },
      attributes: [
        "complaint",
        "diagnosis",
        "medicines",
        "advice",
        "consultationType",
        "status",
        "visitDate",
      ],
      include: [
        {
          model: Doctor,
          attributes: ["fullName"],
        },
      ],
      order: [["visitDate", "DESC"]],
      limit: 5,
    });
    return res.status(200).json({
      success: true,
      patient,
      recentVisits,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching patient details",
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;

    const doctor = await Doctor.findByPk(doctorId, {
      attributes: [
        "id",
        "fullName",
        "email",
        "phoneNumber",
        "governmentLicenseId",
        "address",
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching doctor profile",
    });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;

    const { phoneNumber, address } = req.body;

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.phoneNumber = phoneNumber;
    doctor.address = address;

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error updating doctor profile",
    });
  }
};

export const getDoctorWorkspace = async (req, res) => {
  try {
    const { uhid } = req.params;

    const patient = await Patient.findOne({ where: { uhid } });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const recentVisits = await EHR.findAll({
      where: { patientId: patient.id },
      include: [
        {
          model: Doctor,
          attributes: ["fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      patient,
      recentVisits,
      latestVisit: recentVisits.length > 0 ? recentVisits[0] : null,
    });
  } catch (error) {
    console.error("Workspace loading failed:", error);
    return res.status(500).json({
      success: false,
      message: "Workspace loading failed",
    });
  }
};

export const getDoctorWorkspaceSummary = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const countUniquePatients = (fromDate) =>
      EHR.count({
        where: {
          doctorId,
          ...(fromDate ? { createdAt: { [Op.gte]: fromDate } } : {}),
        },
        distinct: true,
        col: "patientId",
      });

    const [totalPatients, patientsLastWeek, patientsLastMonth, consultations] =
      await Promise.all([
        countUniquePatients(),
        countUniquePatients(sevenDaysAgo),
        countUniquePatients(thirtyDaysAgo),
        EHR.count({ where: { doctorId } }),
      ]);

    return res.status(200).json({
      success: true,
      totalPatients,
      patientsLastWeek,
      patientsLastMonth,
      consultations,
    });
  } catch (error) {
    console.error("Workspace summary failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load workspace summary" });
  }
};

export const generateConsultationDraft = async (req, res) => {
  const transcript = String(req.body?.transcript || "").trim();
  const patientContext = req.body?.patientContext || {};
  const uhid = String(req.body?.uhid || "").trim();
  if (!transcript) {
    return res
      .status(400)
      .json({ success: false, message: "A voice transcript is required." });
  }

  // The transcript is deliberately kept request-only: it is never written to
  // the database, logs, EHR, or session storage by this endpoint.
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      success: false,
      message:
        "AI drafting is not configured. Add GROQ_API_KEY to the server environment.",
    });
  }

  try {
    // Load the clinical history on the server rather than trusting a browser
    // copy. Only the last five non-identifying consultation records are sent
    // to Groq for this one draft request; they are never stored by this flow.
    let previousConsultations = [];
    if (uhid) {
      const patient = await Patient.findOne({
        where: { uhid },
        attributes: ["id"],
      });
      if (patient) {
        const records = await EHR.findAll({
          where: { patientId: patient.id },
          attributes: [
            "visitDate",
            "complaint",
            "diagnosis",
            "medicines",
            "advice",
            "status",
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        });
        previousConsultations = records.map((record) => ({
          visitDate: record.visitDate,
          complaint: String(record.complaint || "").slice(0, 1500),
          diagnosis: String(record.diagnosis || "").slice(0, 1000),
          medicines: String(record.medicines || "").slice(0, 1500),
          advice: String(record.advice || "").slice(0, 1500),
          status: record.status,
        }));
      }
    }

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an AI Clinical Documentation Assistant for a licensed medical practitioner. Your role is to listen to the natural conversation between the doctor and the patient, understand the patient's symptoms, history, examination findings, and the doctor's intent, and generate a comprehensive draft Electronic Health Record (EHR).

The generated content is ONLY a draft for clinician review. The doctor will always review, edit, accept, reject, or replace any generated content before saving the consultation. Your output must never be considered a final prescription or confirmed diagnosis.

Generate a detailed but concise Electronic Health Record that reflects a real outpatient consultation. The content should be complete enough that a doctor only needs to make minor corrections before saving.

Return ONLY valid JSON with exactly these keys:

{
  "complaint": "",
  "diagnosis": "",
  "medicines": "",
  "advice": "",
  "followUpDate": "",
  "reviewNote": ""
}

Instructions for each field:

• complaint
Generate a clinically meaningful chief complaint based on the patient-doctor conversation. Include duration, severity, progression, and associated symptoms whenever mentioned.

• diagnosis
Based on the conversation, previous medical history, and symptoms, generate the most likely provisional diagnosis or differential diagnosis. If sufficient evidence is unavailable, provide the most probable diagnosis and clearly indicate that it is provisional and requires clinician confirmation.

• medicines
Based on the probable diagnosis, generate a draft prescription using commonly accepted medicines that may be appropriate for the suspected condition.

For each medicine include:
- Medicine Name
- Strength
- Dosage
- Frequency
- Duration
- Route of administration
- Special instructions if appropriate

If the doctor explicitly mentioned medicines during the consultation, prioritize those medicines.

If medicines were not explicitly dictated, you MAY suggest likely medicines commonly used for the predicted diagnosis. Clearly indicate that these are AI-generated draft suggestions requiring clinician approval.

Never claim that the medicines are confirmed prescriptions.

• advice
Generate appropriate lifestyle advice, dietary recommendations, hydration advice, activity modifications, AYUSH recommendations where suitable, home care measures, and warning signs that should prompt immediate medical attention.
The advice should be practical, medically appropriate, and relevant to the predicted diagnosis.
• followUpDate
If the doctor specifies a review date, use it.
Otherwise choose a reasonable follow-up date based on the suspected condition. For routine outpatient illnesses use approximately 7 days from the supplied current date. For chronic diseases choose an appropriate review interval. Return the date in ISO format (YYYY-MM-DD).
• reviewNote
Write one short note reminding the doctor about any uncertainty, missing information, investigations that may be required, allergies that should be verified, possible contraindications, or the need to confirm the AI-generated diagnosis and medicines before finalizing the consultation.
General Rules:
- Generate content as a professional Electronic Health Record, not as short notes.
- Use proper medical terminology while keeping the language readable.
- Consider previous consultation history and chronic conditions supplied in the patient context.
- Respect documented allergies and comorbidities.
- Never expose patient identifiers such as name, UHID, phone number, email, or address.
- Do not fabricate laboratory results or physical examination findings that were never mentioned.
- Diagnosis and medicines may be predicted using clinical reasoning, but they must always be clearly understood as draft suggestions for clinician review.
- The doctor has complete authority over every generated field and is responsible for reviewing, modifying, approving, or rejecting all AI-generated content before saving the Electronic Health Record.
- Return ONLY valid JSON without markdown, explanations, or additional text.`,
        },
        {
          role: "user",
          content: `Current date: ${new Date().toISOString().slice(0, 10)}\nPatient context: ${JSON.stringify(
            {
              dateOfBirth: patientContext.dateOfBirth || "not provided",
              allergies: patientContext.allergies || "not recorded",
              chronicConditions:
                patientContext.chronicConditions || "not recorded",
              previousConsultations,
            },
          )}\n\nClinician transcript:\n${transcript}`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned no draft");

    const sourceDraft = JSON.parse(
      content.replace(/^```json\s*|\s*```$/g, "").trim(),
    );
    const draft = {
      complaint: String(sourceDraft.complaint || ""),
      diagnosis: String(sourceDraft.diagnosis || ""),
      medicines: String(sourceDraft.medicines || ""),
      advice: String(sourceDraft.advice || ""),
      followUpDate: /^\d{4}-\d{2}-\d{2}$/.test(
        String(sourceDraft.followUpDate || ""),
      )
        ? String(sourceDraft.followUpDate)
        : "",
      reviewNote: String(
        sourceDraft.reviewNote || "Review this AI draft before saving.",
      ),
    };

    return res.status(200).json({ success: true, draft });
  } catch (error) {
    console.error("AI draft request failed:", error.message);
    return res
      .status(502)
      .json({
        success: false,
        message: "AI drafting is temporarily unavailable.",
      });
  }
};
