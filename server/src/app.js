import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import Patient from "./models/patientModel.js";
import Doctor from "./models/doctorModel.js";
import ApprovedLicense from "./models/approvedLicenseModel.js";
import EHR from "./models/ehrModel.js";
import Student from "./models/studentModel.js";

import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import govRoutes from "./routes/govRoutes.js";
import ehrRoutes from "./routes/ehrRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import ChatRequest from "./models/chatRequestModel.js";
import VideoRequest from "./models/videoRequestModel.js";
import Review from "./models/reviewModel.js";
import Message from "./models/messageModel.js";

Patient.hasMany(EHR, {
  foreignKey: "patientId",
});

EHR.belongsTo(Patient, {
  foreignKey: "patientId",
});

Doctor.hasMany(EHR, {
  foreignKey: "doctorId",
});

EHR.belongsTo(Doctor, {
  foreignKey: "doctorId",
});

Patient.hasMany(ChatRequest, {
  foreignKey: "patientId",
});

ChatRequest.belongsTo(Patient, {
  foreignKey: "patientId",
});

Student.hasMany(ChatRequest, {
  foreignKey: "studentId",
});

ChatRequest.belongsTo(Student, {
  foreignKey: "studentId",
});

Patient.hasMany(VideoRequest, {
  foreignKey: "patientId",
});

VideoRequest.belongsTo(Patient, {
  foreignKey: "patientId",
});

Student.hasMany(VideoRequest, {
  foreignKey: "studentId",
});

VideoRequest.belongsTo(Student, {
  foreignKey: "studentId",
});

Patient.hasMany(Review, {
  foreignKey: "patientId",
});

Review.belongsTo(Patient, {
  foreignKey: "patientId",
});

Student.hasMany(Review, {
  foreignKey: "studentId",
});

Review.belongsTo(Student, {
  foreignKey: "studentId",
});

const app = express();

const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: clientOrigins }));
app.use(express.json());

app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/gov", govRoutes);
app.use("/api/ehr", ehrRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("AYUSH AI is runnig correct");
});

// Public, database-independent endpoint for deployment health checks.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "AYUSH API" });
});

export const databaseReady = sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connection established successfully.");
    // Altering a live healthcare schema automatically is unsafe. Local
    // development keeps the convenience; production creates missing tables
    // only and should use reviewed migrations for later schema changes.
    await sequelize.sync(
      process.env.NODE_ENV === "production" ? {} : { alter: true },
    );
    console.log("all table synced succesfully");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    throw err;
  });

export default app;
