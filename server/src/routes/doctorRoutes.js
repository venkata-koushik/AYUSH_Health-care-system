import express from "express";
import cors from "cors";
import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  doctorDashboard,
  getDoctorWorkspace,
  getDoctorWorkspaceSummary,
  generateConsultationDraft,
  getPatientHistory,
  getMyPatients,
  getMyPatientDetails,
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import { verifyDoctorToken } from "../middleware/verifyDoctorToken.js";
import { createEHR } from "../controllers/ehrController.js";
const router = express.Router();

router.post("/register", registerDoctor);
router.post("/logout", logoutDoctor);
router.post("/login", loginDoctor);
router.get("/dashboard", verifyDoctorToken, doctorDashboard);
// Patient details and full history return different response shapes and need
// separate endpoints for their corresponding doctor pages.
router.get("/patient/:uhid", verifyDoctorToken, getMyPatientDetails);
router.get("/patient-history/:uhid", verifyDoctorToken, getPatientHistory);
router.get("/my-patients", verifyDoctorToken, getMyPatients);
//  router.get('/my-patient/:uhid',verifyDoctorToken,getMyPatientDetails);
router.get("/profile", verifyDoctorToken, getDoctorProfile);
router.put("/profile", verifyDoctorToken, updateDoctorProfile);
router.post("/ehr", verifyDoctorToken, createEHR);
router.get("/workspace-summary", verifyDoctorToken, getDoctorWorkspaceSummary);
router.post(
  "/consultation-draft",
  verifyDoctorToken,
  generateConsultationDraft,
);
router.get("/workspace/:uhid", verifyDoctorToken, getDoctorWorkspace);
export default router;
