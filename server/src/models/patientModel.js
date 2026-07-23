import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Patient = sequelize.define("Patient", {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    aadhaarNumber: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
    },

  panNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull:true,
  },

  phoneNumber:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
  },
     email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },

    bloodgroup:{
        type: DataTypes.STRING,
    },
     allergies: {
    type: DataTypes.TEXT,
  },
    chronicConditions:{
        type: DataTypes.TEXT,
    },
    address:{
        type: DataTypes.TEXT,
    },
     preferredLanguage: {
    type: DataTypes.STRING,
    defaultValue: "English",
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uhid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  // gpsEnabled: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  // },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // passwordResetToken: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // passwordResetExpires: {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  // },
  // otp: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // otpExpires: {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  // },
  
});

export default Patient;
