import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  requestId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consultationType: {
    type: DataTypes.ENUM("Chat", "Video"),
    allowNull: false
  },
  senderRole: {
    type: DataTypes.ENUM("Patient", "Student"),
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      notEmpty(value) {
        if (!value && !this.fileUrl) {
          throw new Error("A message or file URL is required");
        }
      }
    }
  },
  messageType: {
    type: DataTypes.ENUM("Text", "Voice", "Image", "File"),
    allowNull: false,
    defaultValue: "Text"
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  timestamps: true
});

export default Message;
