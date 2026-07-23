import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChatRequest = sequelize.define("ChatRequest",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    patientId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    patientName:{
        type:DataTypes.STRING,
        allowNull:false
    },
    uhid:{
        type:DataTypes.STRING,
        allowNull:false
    },
    complaint:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    language:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM(
            "Pending",
            "Accepted",
            "Rejected",
            "Completed"
        ),
        defaultValue:"Pending"
    },
    recommendedDoctor:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    recommendationReason:{
        type:DataTypes.TEXT,
        defaultValue:""
    },
    acceptedAt:{
        type:DataTypes.DATE
    },
    completedAt:{
        type:DataTypes.DATE
    }
});

export default ChatRequest;