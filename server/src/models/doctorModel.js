import {DataTypes} from "sequelize";
import sequelize from "../config/db.js";

const Doctor = sequelize.define("Doctor",{
   id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uhid: {
  type: DataTypes.STRING,
  unique: true,
},
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  governmentLicenseId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  address: {
    type: DataTypes.TEXT,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Doctor;