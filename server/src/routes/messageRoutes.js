import express from "express";

import { sendMessage, getMessages } from "../controllers/messageController.js";

import { verifyConsultationUser } from "../middleware/verifyConsultationUser.js";

const router = express.Router();

router.post("/send", verifyConsultationUser, sendMessage);

router.get("/:requestId", verifyConsultationUser, getMessages);

export default router;
