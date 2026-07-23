import express from "express";
import cors from "cors";
import { verifyStudentToken } from "../middleware/verifyStudentToken.js";
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  studentDashboard,
  getVideoRequests,
  getStudentProfile,
  getChatRequests,
  updateStudentProfile,
  getLeaderboard,
  getReviewHistory,
  getWeeklyStatistics,
  getMonthlyStatistics,
} from "../controllers/studentController.js";

import {
  acceptChatRequest,
  rejectChatRequest,
  completeChatRequest,
  getStudentHistory,
  acceptVideoRequest,
  rejectVideoRequest,
  completeVideoRequest,
} from "../controllers/studentController.js";
const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);

router.get("/dashboard", verifyStudentToken, studentDashboard);

router.get("/profile", verifyStudentToken, getStudentProfile);
router.put("/profile", verifyStudentToken, updateStudentProfile);

router.get("/chat-request", verifyStudentToken, getChatRequests);
router.get("/video-requests", verifyStudentToken, getVideoRequests);

router.put("/chat-request/:id/accept", verifyStudentToken, acceptChatRequest);
router.put("/chat-request/:id/reject", verifyStudentToken, rejectChatRequest);
router.put(
  "/chat-request/:id/complete",
  verifyStudentToken,
  completeChatRequest,
);
router.put("/video-request/:id/accept", verifyStudentToken, acceptVideoRequest);
router.put("/video-request/:id/reject", verifyStudentToken, rejectVideoRequest);
router.put(
  "/video-request/:id/complete",
  verifyStudentToken,
  completeVideoRequest,
);

router.get("/history", verifyStudentToken, getStudentHistory);

router.get("/leaderboard", verifyStudentToken, getLeaderboard);
router.get("/reviews", verifyStudentToken, getReviewHistory);
router.get("/weekly-stats", verifyStudentToken, getWeeklyStatistics);
router.get("/monthly-stats", verifyStudentToken, getMonthlyStatistics);

export default router;
