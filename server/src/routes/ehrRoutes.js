import express from "express";

import {
  createEHR,
  getPatientEHR,
  getSingleEHR,
} from "../controllers/ehrController.js";
import { verifyDoctorToken } from "../middleware/verifyDoctorToken.js";

const router = express.Router();

router.post("/create", verifyDoctorToken, createEHR);

router.get("/patient/:patientId", verifyDoctorToken, getPatientEHR);

router.get("/:ehrId", verifyDoctorToken, getSingleEHR);

export default router;
