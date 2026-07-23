import express from "express";
import {
  registerPatient,
  loginPatient,
  logoutPatient,
  getMyRecords,
  getMyProfile,
  updateMyProfile,
  getMyChatRequests,
  getMyVideoRequests,
  getPatientProfile,
  createChatRequest,
  createVideoRequest,
  submitReview,
  checkPendingReview,
  getCurrentRequest,
  getAiGuidance,
} from "../controllers/patientController.js";
import { verifyPatientToken } from "../middleware/verifyPatientToken.js";
const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/logout", logoutPatient);
router.get("/my-records", verifyPatientToken, getMyRecords);
router.get("/profile", verifyPatientToken, getMyProfile);
router.put("/profile", verifyPatientToken, updateMyProfile);

router.post("/chat-request", verifyPatientToken, createChatRequest);
router.post("/video-request", verifyPatientToken, createVideoRequest);
router.post("/review", verifyPatientToken, submitReview);

router.get("/chat-history", verifyPatientToken, getMyChatRequests);
router.get("/video-history", verifyPatientToken, getMyVideoRequests);
router.get("/pending-review", verifyPatientToken, checkPendingReview);
router.get("/current-request", verifyPatientToken, getCurrentRequest);
router.post("/ai-guidance", verifyPatientToken, getAiGuidance);
export default router;
