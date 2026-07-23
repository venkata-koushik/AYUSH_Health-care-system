import express from "express";
import { getPatientQr } from "../controllers/qrController.js";
import { verifyPatientToken } from "../middleware/verifyPatientToken.js";

const router = express.Router();

router.get("/me", verifyPatientToken, getPatientQr);

export default router;
