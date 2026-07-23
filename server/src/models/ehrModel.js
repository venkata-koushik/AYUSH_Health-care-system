import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

export  const EHR = sequelize.define("EHR", {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  complaint: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  diagnosis: {
    type: DataTypes.TEXT,
  },

  // Structured categories power aggregate government analytics; diagnosis
  // remains the doctor's full, clinician-reviewed diagnosis.
  diagnosisCategories: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },

  otherDiagnosisDetails: {
    type: DataTypes.TEXT,
  },

  medicines: {
    type: DataTypes.TEXT,
  },

  advice: {
    type: DataTypes.TEXT,
  },

  manualNotes: {
    type: DataTypes.TEXT,
  },

  reportPhoto: {
    type: DataTypes.TEXT,
  },

  consultationType: {
    type: DataTypes.STRING,
  },

  followUpDate: {
    type: DataTypes.DATEONLY,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Open",
  },

  doctorSignature: {
    type: DataTypes.STRING,
  },

  visitDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
});


export default EHR;
