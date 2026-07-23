import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define("Student", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    instituteName: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    collegeEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    //------------------------------------
    // Student Profile
    //------------------------------------

    profilePhoto: {
        type: DataTypes.STRING,
        defaultValue: "",
    },

    bio: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },

    languages: {
        type: DataTypes.JSON,
        defaultValue: [],
    },

    //------------------------------------
    // Approval
    //------------------------------------

    approvalStatus: {
        type: DataTypes.ENUM(
            "Pending",
            "Approved",
            "Rejected"
        ),
        defaultValue: "Approved",
    },

    //------------------------------------
    // Availability
    //------------------------------------

    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    //------------------------------------
    // Dashboard Statistics
    //------------------------------------

    patientsHelped: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    doctorReferrals: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    completedChats: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    completedVideoCalls: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    //------------------------------------
    // Rating
    //------------------------------------

    totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    }

});

export default Student;