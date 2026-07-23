import Message from "../models/messageModel.js";
import ChatRequest from "../models/chatRequestModel.js";
import VideoRequest from "../models/videoRequestModel.js";
import { consultationRoom, getSocketServer } from "../sockets/socket.js";

const consultationModels = {
  Chat: ChatRequest,
  Video: VideoRequest,
};

const messageTypes = new Set(["Text", "Voice", "Image", "File"]);

const findAuthorizedConsultation = async ({
  requestId,
  consultationType,
  user,
}) => {
  const Consultation = consultationModels[consultationType];
  if (!Consultation) {
    return {
      error: { status: 400, message: "consultationType must be Chat or Video" },
    };
  }

  const consultation = await Consultation.findByPk(requestId);
  if (!consultation) {
    return { error: { status: 404, message: "Consultation not found" } };
  }

  const isPatient =
    user.role === "patient" && consultation.patientId === user.patientId;
  const isStudent =
    user.role === "student" && consultation.studentId === user.studentId;
  if (!isPatient && !isStudent) {
    return {
      error: { status: 403, message: "You are not part of this consultation" },
    };
  }

  return { consultation };
};

export const sendMessage = async (req, res) => {
  try {
    const {
      requestId,
      consultationType,
      message,
      messageType = "Text",
      fileUrl,
    } = req.body;
    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    if (!Number.isInteger(Number(requestId))) {
      return res
        .status(400)
        .json({ success: false, message: "A valid requestId is required" });
    }
    if (!messageTypes.has(messageType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message type" });
    }
    if (!normalizedMessage && !fileUrl) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message text or a file URL is required",
        });
    }

    const { consultation, error } = await findAuthorizedConsultation({
      requestId: Number(requestId),
      consultationType,
      user: req.user,
    });
    if (error)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    if (consultation.status !== "Accepted") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Messages can only be sent in an accepted consultation",
        });
    }

    const newMessage = await Message.create({
      requestId: Number(requestId),
      consultationType,
      senderRole: req.user.role === "patient" ? "Patient" : "Student",
      senderId:
        req.user.role === "patient" ? req.user.patientId : req.user.studentId,
      message: normalizedMessage || null,
      messageType,
      fileUrl: fileUrl || null,
    });

    getSocketServer()
      ?.to(consultationRoom(consultationType, Number(requestId)))
      .emit("message:new", newMessage.toJSON());

    return res
      .status(201)
      .json({ success: true, message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to send message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const consultationType = req.query.consultationType;

    if (!Number.isInteger(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid requestId is required" });
    }

    const { error } = await findAuthorizedConsultation({
      requestId,
      consultationType,
      user: req.user,
    });
    if (error)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    const messages = await Message.findAll({
      where: { requestId, consultationType },
      order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch messages" });
  }
};
