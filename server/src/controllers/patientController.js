import Patient from "../models/patientModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Doctor from "../models/doctorModel.js";
import EHR from "../models/ehrModel.js";
import Student from "../models/studentModel.js";
import ChatRequest from "../models/chatRequestModel.js";
import Review from "../models/reviewModel.js";
import VideoRequest from "../models/videoRequestModel.js";
import sequelize from "../config/db.js";
import groqClient from "../config/groqClient.js";

const normalizeLanguages = (languages) => {
  const values = Array.isArray(languages) ? languages : [languages];
  return [
    ...new Set(
      values
        .map((language) =>
          String(language || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
};

const findAvailableStudent = async (languages) => {
  const requestedLanguages = normalizeLanguages(languages);
  const students = await Student.findAll({ where: { isAvailable: true } });
  const matches = students.filter((student) => {
    const studentLanguages = normalizeLanguages(student.languages);
    return requestedLanguages.some((language) =>
      studentLanguages.includes(language),
    );
  });

  return { requestedLanguages, matches, availableStudents: students.length };
};
export const registerPatient = async (req, res) => {
  try {
    const {
      fullName,
      aadhaarNumber,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      bloodgroup,
      allergies,
      chronicConditions,
      address,
      preferredLanguage,
      state,
      district,
      password,
    } = req.body;
    if (
      !fullName ||
      !aadhaarNumber ||
      !phoneNumber ||
      !email ||
      !dateOfBirth ||
      !gender ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required registration fields.",
      });
    }
    if (!/^\d{12}$/.test(String(aadhaarNumber))) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must contain 12 digits.",
      });
    }
    if (!String(state || "").trim() || !String(district || "").trim()) {
      return res.status(400).json({
        success: false,
        message:
          "State and district are required for healthcare service and anonymized public-health analytics.",
      });
    }

    const existingPatient = await Patient.findOne({
      where: { [Op.or]: [{ email }, { aadhaarNumber }, { phoneNumber }] },
    });
    if (existingPatient) {
      const field =
        existingPatient.email === email
          ? "email"
          : existingPatient.aadhaarNumber === aadhaarNumber
            ? "Aadhaar number"
            : "phone number";
      return res.status(400).json({
        success: false,
        message: `A patient already exists with this ${field}.`,
      });
    }
    // Generate UHID
    const patientCount = await Patient.count();

    const uhid = `UHID${new Date().getFullYear()}${String(
      patientCount + 1,
    ).padStart(4, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      uhid,
      fullName,
      aadhaarNumber,
      phoneNumber,
      email,
      dateOfBirth,
      gender: String(gender).trim(),
      bloodgroup,
      allergies,
      chronicConditions,
      address,
      preferredLanguage,
      state: String(state).trim(),
      district: String(district).trim(),
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      uhid: patient.uhid,
    });
  } catch (error) {
    console.error("Patient Register Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginPatient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({
      where: { email },
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "incorrect password or email for patient login",
      });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "incorrect password or email for patient login",
      });
    }

    const token = jwt.sign(
      {
        patientId: patient.id,
        email: patient.email,
        role: "patient",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "the patient logged in successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal issue in the patient login",
    });
  }
};

export const logoutPatient = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "patient logged out successfully",
  });
};

export const getMyProfile = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const patient = await Patient.findByPk(patientId, {
      attributes: [
        "id",
        "uhid",
        "fullName",
        "dateOfBirth",
        "gender",
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

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error in getMyProfile",
    });
  }
};

// presently not using
export const updateMyProfile = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const allowedFields = [
      "fullName",
      "phoneNumber",
      "address",
      "preferredLanguage",
      "gender",
      "state",
      "district",
      "bloodgroup",
      "allergies",
      "chronicConditions",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      (updates.state !== undefined && !String(updates.state).trim()) ||
      (updates.district !== undefined && !String(updates.district).trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "State and district cannot be blank.",
      });
    }
    if (updates.state !== undefined)
      updates.state = String(updates.state).trim();
    if (updates.district !== undefined)
      updates.district = String(updates.district).trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "no valid fields provided",
      });
    }

    await Patient.update(updates, {
      where: { id: patientId },
    });

    const patient = await Patient.findByPk(patientId, {
      attributes: [
        "id",
        "uhid",
        "fullName",
        "dateOfBirth",
        "gender",
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

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error in updateMyProfile",
    });
  }
};

export const getMyRecords = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const records = await EHR.findAll({
      where: {
        patientId,
      },
      attributes: [
        "complaint",
        "diagnosis",
        "diagnosisCategories",
        "otherDiagnosisDetails",
        "medicines",
        "advice",
        "consultationType",
        "followUpDate",
        "status",
        "visitDate",
        "doctorSignature",
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
      records,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error in getmyrecords",
    });
  }
};

export const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const patient = await Patient.findByPk(patientId, {
      attributes: [
        "uhid",
        "fullName",
        "email",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "bloodgroup",
        "allergies",
        "chronicConditions",
        "address",
        "preferredLanguage",
        "state",
        "district",
      ],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching patient profile",
    });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const { address, allergies, chronicConditions, preferredLanguage } =
      req.body;

    const patient = await Patient.findByPk(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    patient.address = address;
    patient.allergies = allergies;
    patient.chronicConditions = chronicConditions;
    patient.preferredLanguage = preferredLanguage;

    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      patient,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

export const createChatRequest = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { complaint, languages, language } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const activeRequest =
      (await ChatRequest.findOne({
        where: { patientId, status: { [Op.in]: ["Pending", "Accepted"] } },
      })) ||
      (await VideoRequest.findOne({
        where: { patientId, status: { [Op.in]: ["Pending", "Accepted"] } },
      }));
    if (activeRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active consultation request",
      });
    }

    const {
      requestedLanguages,
      matches: filteredStudents,
      availableStudents,
    } = await findAvailableStudent(languages || language);
    if (requestedLanguages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one preferred language",
      });
    }

    if (filteredStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          availableStudents === 0
            ? "No student is currently available for consultation"
            : "No available student speaks one of the selected languages",
      });
    }

    const randomStudent =
      filteredStudents[Math.floor(Math.random() * filteredStudents.length)];

    const request = await ChatRequest.create({
      patientId,
      studentId: randomStudent.id,
      patientName: patient.fullName,
      uhid: patient.uhid,
      complaint,
      language: requestedLanguages.join(", "),
    });

    return res.status(201).json({
      success: true,
      message: "Chat request sent successfully",
      student: {
        id: randomStudent.id,
        name: randomStudent.name,
      },
      request,
    });
  } catch (error) {
    console.error("Error creating chat request:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating chat request",
    });
  }
};

export const createVideoRequest = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { complaint, languages, language } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const activeRequest =
      (await ChatRequest.findOne({
        where: { patientId, status: { [Op.in]: ["Pending", "Accepted"] } },
      })) ||
      (await VideoRequest.findOne({
        where: { patientId, status: { [Op.in]: ["Pending", "Accepted"] } },
      }));
    if (activeRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active consultation request",
      });
    }

    const {
      requestedLanguages,
      matches: filteredStudents,
      availableStudents,
    } = await findAvailableStudent(languages || language);
    if (requestedLanguages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one preferred language",
      });
    }

    if (filteredStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          availableStudents === 0
            ? "No student is currently available for consultation"
            : "No available student speaks one of the selected languages",
      });
    }

    const randomStudent =
      filteredStudents[Math.floor(Math.random() * filteredStudents.length)];

    const request = await VideoRequest.create({
      patientId,
      studentId: randomStudent.id,
      patientName: patient.fullName,
      uhid: patient.uhid,
      complaint,
      language: requestedLanguages.join(", "),
    });

    return res.status(201).json({
      success: true,
      message: "Video request sent successfully",
      student: {
        id: randomStudent.id,
        name: randomStudent.name,
      },
      request,
    });
  } catch (error) {
    console.error("========== VIDEO REQUEST ERROR ==========");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitReview = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { requestId, consultationType, rating, feedback } = req.body;
    const normalizedRating = Number(rating);

    if (
      !Number.isInteger(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    let request;

    if (consultationType === "Chat") {
      request = await ChatRequest.findByPk(requestId);
    } else {
      request = await VideoRequest.findByPk(requestId);
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    if (request.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "A review can only be submitted after the consultation is completed",
      });
    }

    if (request.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const ratingSummary = await sequelize.transaction(async (transaction) => {
      const existingReview = await Review.findOne({
        where: { patientId, requestId, requestType: consultationType },
        transaction,
      });
      if (existingReview) {
        const duplicateError = new Error(
          "A review has already been submitted for this consultation",
        );
        duplicateError.status = 400;
        throw duplicateError;
      }

      await Review.create(
        {
          patientId,
          studentId: request.studentId,
          requestId,
          requestType: consultationType,
          consultationType,
          rating: normalizedRating,
          review: typeof feedback === "string" ? feedback.trim() : "",
        },
        { transaction },
      );

      const reviews = await Review.findAll({
        where: { studentId: request.studentId },
        attributes: ["rating"],
        transaction,
        raw: true,
      });
      const totalReviews = reviews.length;
      const averageRating =
        reviews.reduce((total, review) => total + Number(review.rating), 0) /
        totalReviews;

      const [updated] = await Student.update(
        { totalReviews, averageRating },
        { where: { id: request.studentId }, transaction },
      );
      if (!updated) {
        const studentError = new Error("Student not found");
        studentError.status = 404;
        throw studentError;
      }

      return { totalReviews, averageRating };
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      rating: ratingSummary,
    });
  } catch (error) {
    console.error("Submit Review Error:", error);

    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyChatRequests = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const requests = await ChatRequest.findAll({
      where: { patientId },
      include: [
        {
          model: Student,
          attributes: ["id", "name", "averageRating"],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "status",
        "complaint",
        "language",
        "createdAt",
        "completedAt",
      ],
    });

    return res.status(200).json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching chat requests",
    });
  }
};

export const getMyVideoRequests = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const requests = await VideoRequest.findAll({
      where: { patientId },
      include: [
        {
          model: Student,
          attributes: ["id", "name", "averageRating"],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "status",
        "complaint",
        "language",
        "meetingLink",
        "createdAt",
        "completedAt",
      ],
    });

    return res.status(200).json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Error fetching video history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching video requests",
    });
  }
};

export const checkPendingReview = async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const pendingReviews = [];

    // Check Chats
    const completedChats = await ChatRequest.findAll({
      where: { patientId, status: "Completed" },
    });

    for (const chat of completedChats) {
      const exists = await Review.findOne({
        where: {
          patientId,
          requestId: chat.id,
          requestType: "Chat",
        },
      });
      if (!exists) {
        pendingReviews.push({ ...chat.toJSON(), type: "Chat" });
      }
    }

    // Check Videos
    const completedVideos = await VideoRequest.findAll({
      where: { patientId, status: "Completed" },
    });

    for (const video of completedVideos) {
      const exists = await Review.findOne({
        where: {
          patientId,
          requestId: video.id,
          requestType: "Video",
        },
      });
      if (!exists) {
        pendingReviews.push({ ...video.toJSON(), type: "Video" });
      }
    }

    return res.status(200).json({
      success: true,
      totalPending: pendingReviews.length,
      pendingReviews,
    });
  } catch (error) {
    console.error("Error checking pending reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking reviews",
    });
  }
};

export const getCurrentRequest = async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const chat = await ChatRequest.findOne({
      where: {
        patientId,
        status: {
          [Op.in]: ["Pending", "Accepted", "Completed"],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    const video = await VideoRequest.findOne({
      where: {
        patientId,
        status: {
          [Op.in]: ["Pending", "Accepted", "Completed"],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    const latestRequest = [
      chat && { request: chat, consultationType: "Chat" },
      video && { request: video, consultationType: "Video" },
    ]
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b.request.createdAt) - new Date(a.request.createdAt),
      )[0];

    if (latestRequest) {
      return res.status(200).json({
        success: true,
        consultationType: latestRequest.consultationType,
        status: latestRequest.request.status,
        requestId: latestRequest.request.id,
      });
    }

    return res.status(200).json({
      success: true,
      status: "None",
    });
  } catch (error) {
    console.error("Current Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Guidance only: this is deliberately separate from consultations and never
// stores a patient conversation in the clinical record.
export const getAiGuidance = async (req, res) => {
  try {
    const question = String(req.body?.message || "").trim();
    if (!question || question.length > 1500) {
      return res.status(400).json({ success: false, message: "Please enter a question of up to 1,500 characters." });
    }

    const emergencyPattern = /chest pain|trouble breathing|difficulty breathing|unconscious|suicid|severe bleeding|stroke|seizure/i;
    if (emergencyPattern.test(question)) {
      return res.status(200).json({ success: true, reply: "This may need urgent attention. Please call your local emergency number or go to the nearest emergency department now. Do not wait for an online reply.", source: "safety" });
    }

    const fallback = "I can provide general health information, but I cannot diagnose you. For symptoms that persist, worsen, or concern you, please request a consultation with a qualified healthcare professional.";
    if (!process.env.GROQ_API_KEY) return res.status(200).json({ success: true, reply: fallback, source: "guidance" });

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.25,
      max_tokens: 180,
      messages: [
        { role: "system", content: "You are AYUSH Care Guide, a friendly and practical health-information assistant for India. Answer directly first, in plain language, using short bullet points when helpful. Give sensible self-care, prevention, food, hygiene, or lifestyle suggestions when appropriate. You may explain common symptoms and conditions, but do not diagnose, prescribe medicines, or claim certainty. Do NOT automatically tell the person to consult a clinician; suggest a consultation only for persistent, worsening, severe, unusual, or personally concerning symptoms. Keep the answer under 140 words. For emergency symptoms, clearly advise urgent local emergency care. Never request personal identifiers or replace a clinician." },
        { role: "user", content: question },
      ],
    });
    return res.status(200).json({ success: true, reply: String(completion.choices?.[0]?.message?.content || fallback).trim(), source: "AI guidance" });
  } catch (error) {
    console.error("Patient AI guidance error:", error.message);
    return res.status(200).json({ success: true, reply: "The health guide is temporarily unavailable. You can still request a consultation with a student or doctor.", source: "unavailable" });
  }
};
