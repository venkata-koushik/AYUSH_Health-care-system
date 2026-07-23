import Student from "../models/studentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Op } from "sequelize";
import Patient from "../models/patientModel.js";
import ChatRequest from "../models/chatRequestModel.js";
import Review from "../models/reviewModel.js";
import VideoRequest from "../models/videoRequestModel.js";

export const registerStudent = async (req, res) => {
  try {
    const {
      name,
      instituteName,
      collegeEmail,
      phoneNumber,
      password,
      languages,
    } = req.body;

    const existingStudent = await Student.findOne({
      where: { collegeEmail },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedLanguages = Array.isArray(languages)
      ? [
          ...new Set(
            languages
              .map((language) => String(language).trim())
              .filter(Boolean),
          ),
        ]
      : [];

    if (normalizedLanguages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Select at least one language" });
    }

    await Student.create({
      name,
      instituteName,
      collegeEmail,
      phoneNumber,
      password: hashedPassword,
      languages: normalizedLanguages,
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (error) {
    console.error("Student Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { collegeEmail, password } = req.body;

    const student = await Student.findOne({
      where: { collegeEmail },
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        studentId: student.id,
        email: student.collegeEmail,
        role: "student",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Student logged in successfully",
      token,
    });
  } catch (error) {
    console.error("Student Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutStudent = async (req, res) => {
  console.log("logeout in student");
  return res.status(200).json({
    success: true,
    message: "Student logged out successfully",
  });
};

export const studentDashboard = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const student = await Student.findByPk(studentId, {
      attributes: [
        "id",
        "name",
        "profilePhoto",
        "bio",
        "instituteName",
        "collegeEmail",
        "phoneNumber",
        "approvalStatus",
        "languages",
        "isAvailable",
        "doctorReferrals",
        "completedChats",
        "completedVideoCalls",
        "totalReviews",
        "averageRating",
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const patientsHelped =
      (student.completedChats || 0) + (student.completedVideoCalls || 0);

    const pendingChatRequests = await ChatRequest.count({
      where: {
        studentId,
        status: "Pending",
      },
    });

    const pendingVideoRequests = await VideoRequest.count({
      where: {
        studentId,
        status: "Pending",
      },
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        student,
        patientsHelped,
        pendingChatRequests,
        pendingVideoRequests,
        chatSessions: student.completedChats || 0,
        videoSessions: student.completedVideoCalls || 0,
        doctorReferrals: student.doctorReferrals || 0,
        averageRating: student.averageRating || 0,
        currentRank: "-",
      },
    });
  } catch (error) {
    console.error("Student Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const student = await Student.findByPk(studentId, {
      attributes: [
        "id",
        "name",
        "profilePhoto",
        "bio",
        "instituteName",
        "collegeEmail",
        "phoneNumber",
        "approvalStatus",
        "languages",
        "isAvailable",
        "averageRating",
        "totalReviews",
        "patientsHelped",
        "doctorReferrals",
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Student Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const { phoneNumber, bio, languages, isAvailable } = req.body;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const normalizedLanguages = Array.isArray(languages)
      ? [
          ...new Set(
            languages
              .map((language) => String(language).trim())
              .filter(Boolean),
          ),
        ]
      : [];
    if (normalizedLanguages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Select at least one language" });
    }

    student.phoneNumber = phoneNumber;
    student.bio = bio;
    student.languages = normalizedLanguages;
    student.isAvailable = Boolean(isAvailable);

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Student Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getChatRequests = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const requests = await ChatRequest.findAll({
      where: {
        studentId,
        status: ["Pending", "Accepted"],
      },
      include: [
        {
          model: Patient,
          attributes: ["id", "uhid", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      totalRequests: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error loading chat requests",
    });
  }
};

export const getVideoRequests = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const requests = await VideoRequest.findAll({
      where: {
        studentId,
        status: ["Pending", "Accepted"],
      },
      include: [
        {
          model: Patient,
          attributes: ["id", "uhid", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      totalRequests: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error loading video requests",
    });
  }
};

export const updateChatRequestStatus = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const { id } = req.params;

    const { status, recommendedDoctor, recommendationReason } = req.body;

    const request = await ChatRequest.findOne({
      where: {
        id,
        studentId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = status;

    if (status === "Accepted") {
      request.acceptedAt = new Date();
    }

    if (status === "Completed") {
      request.completedAt = new Date();
      request.recommendedDoctor = recommendedDoctor;
      request.recommendationReason = recommendationReason;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: `Chat request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error updating chat request",
    });
  }
};

export const updateVideoRequestStatus = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const { id } = req.params;

    const { status, meetingLink, recommendedDoctor, recommendationReason } =
      req.body;

    const request = await VideoRequest.findOne({
      where: {
        id,
        studentId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = status;

    if (status === "Accepted") {
      request.acceptedAt = new Date();
      request.meetingLink = meetingLink;
    }

    if (status === "Completed") {
      request.completedAt = new Date();
      request.recommendedDoctor = recommendedDoctor;
      request.recommendationReason = recommendationReason;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: `Video request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error updating video request",
    });
  }
};

export const acceptChatRequest = async (req, res) => {
  try {
    const request = await ChatRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Chat request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be accepted",
        });
    }

    request.status = "Accepted";
    request.acceptedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Chat request accepted",
      request,
    });
  } catch (error) {
    console.error("Accept Chat Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectChatRequest = async (req, res) => {
  try {
    const request = await ChatRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Chat request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be rejected",
        });
    }

    request.status = "Rejected";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Chat request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject Chat Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const completeChatRequest = async (req, res) => {
  try {
    const request = await ChatRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Chat request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Accepted") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only accepted requests can be completed",
        });
    }

    request.status = "Completed";
    request.completedAt = new Date();
    await request.save();
    const student = await Student.findByPk(req.user.studentId);

    student.completedChats = (student.completedChats || 0) + 1;
    student.patientsHelped = (student.patientsHelped || 0) + 1;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Chat request completed",
      request,
    });
  } catch (error) {
    console.error("Complete Chat Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const acceptVideoRequest = async (req, res) => {
  try {
    const request = await VideoRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Video request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be accepted",
        });
    }

    request.status = "Accepted";
    request.acceptedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Video request accepted",
      request,
    });
  } catch (error) {
    console.error("Accept Video Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectVideoRequest = async (req, res) => {
  try {
    const request = await VideoRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Video request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be rejected",
        });
    }

    request.status = "Rejected";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Video request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject Video Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const completeVideoRequest = async (req, res) => {
  try {
    const request = await VideoRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Video request not found",
      });
    }

    if (request.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.status !== "Accepted") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only accepted requests can be completed",
        });
    }

    request.status = "Completed";
    request.callStatus = "Completed";
    request.completedAt = new Date();
    await request.save();
    const student = await Student.findByPk(req.user.studentId);

    student.completedVideoCalls = (student.completedVideoCalls || 0) + 1;
    student.patientsHelped = (student.patientsHelped || 0) + 1;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Video request completed",
      request,
    });
  } catch (error) {
    console.error("Complete Video Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentHistory = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const chats = await ChatRequest.findAll({
      where: { studentId, status: "Completed" },
      include: [
        {
          model: Patient,
          attributes: ["uhid", "fullName"],
        },
      ],
      order: [["completedAt", "DESC"]],
      attributes: [
        "id",
        "complaint",
        "language",
        "recommendedDoctor",
        "completedAt",
      ],
    });

    const videos = await VideoRequest.findAll({
      where: { studentId, status: "Completed" },
      include: [
        {
          model: Patient,
          attributes: ["uhid", "fullName"],
        },
      ],
      order: [["completedAt", "DESC"]],
      attributes: ["id", "complaint", "language", "meetingLink", "completedAt"],
    });

    return res.status(200).json({
      success: true,
      completedChats: chats,
      completedVideos: videos,
    });
  } catch (error) {
    console.error("Error fetching student history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching history",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { approvalStatus: "Approved" },
      attributes: [
        "id",
        "name",
        "completedChats",
        "completedVideoCalls",
        "doctorReferrals",
        "averageRating",
        "totalReviews",
      ],
      order: [
        ["averageRating", "DESC"],
        ["completedChats", "DESC"],
        ["completedVideoCalls", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
};

export const getReviewHistory = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const reviews = await Review.findAll({
      where: { studentId },
      include: [
        {
          model: Patient,
          attributes: ["fullName", "uhid"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
};

export const getWeeklyStatistics = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const chats = await ChatRequest.count({
      where: {
        studentId,
        status: "Completed",
        completedAt: { [Op.gte]: lastWeek },
      },
    });

    const videos = await VideoRequest.count({
      where: {
        studentId,
        status: "Completed",
        completedAt: { [Op.gte]: lastWeek },
      },
    });

    return res.status(200).json({
      success: true,
      completedChats: chats,
      completedVideos: videos,
      totalPatients: chats + videos,
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading weekly statistics",
    });
  }
};

export const getMonthlyStatistics = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const chats = await ChatRequest.count({
      where: {
        studentId,
        status: "Completed",
        completedAt: { [Op.gte]: lastMonth },
      },
    });

    const videos = await VideoRequest.count({
      where: {
        studentId,
        status: "Completed",
        completedAt: { [Op.gte]: lastMonth },
      },
    });

    return res.status(200).json({
      success: true,
      completedChats: chats,
      completedVideos: videos,
      totalPatients: chats + videos,
    });
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading monthly statistics",
    });
  }
};
