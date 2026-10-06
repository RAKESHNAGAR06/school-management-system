const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "general",
        "exam",
        "result",
        "homework",
        "fee",
        "attendance",
        "timetable",
        "event",
        "holiday",
        "emergency",
      ],
      default: "general",
    },

    // Kis audience ke liye notification hai
    targetType: {
      type: String,
      enum: [
        "all",
        "role",
        "class",
        "user",
      ],
      required: true,
      default: "all",
    },

    // targetType = role
    targetRoles: [
      {
        type: String,
        enum: [
          "admin",
          "teacher",
          "student",
          "parent",
        ],
      },
    ],

    // targetType = class
    className: {
      type: String,
      default: "",
      trim: true,
    },

    section: {
      type: String,
      default: "",
      trim: true,
    },

    // targetType = user
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Future external delivery control
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },

      email: {
        type: Boolean,
        default: false,
      },

      whatsapp: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);