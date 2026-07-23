import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Review = sequelize.define("Review",{
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
    requestId:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    requestType:{
        type:DataTypes.ENUM(
            "Chat",
            "Video"
        ),
        allowNull:false
    },
    consultationType:{
        type:DataTypes.ENUM(
            "Chat",
            "Video"
        ),
        allowNull:false
    },
    
    rating:{
        type:DataTypes.INTEGER,
        allowNull:false,
        validate:{
            min:1,
            max:5,
            isInt:true
        }
    },
    review:{
        type:DataTypes.TEXT,
        defaultValue:""
    }
});

export default Review;
