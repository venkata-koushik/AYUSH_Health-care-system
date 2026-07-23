import express from "express";
import {
  govDashboard,
  govHealthInsight,
  govLogin,
} from "../controllers/govController.js";
import { verifyGovToken } from "../middleware/verifyGovToken.js";

const router = express.Router();

router.post("/login", govLogin);
router.get("/dashboard", verifyGovToken, govDashboard);
router.get("/health-insight", verifyGovToken, govHealthInsight);

export default router;
