import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ApprovedLicense = sequelize.define("ApprovedLicense", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  governmentLicenseId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  doctorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default ApprovedLicense;
