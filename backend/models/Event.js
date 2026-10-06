const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["event", "holiday"],
      required: true,
      default: "event",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      all   -> whole school
      role  -> selected roles
      class -> selected class/section
    */
    targetType: {
      type: String,
      enum: ["all", "role", "class"],
      default: "all",
    },

    targetRoles: [
      {
        type: String,
        enum: [
          "teacher",
          "student",
          "parent",
        ],
      },
    ],

    className: {
      type: String,
      default: "",
    },

    section: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Event",
  eventSchema
);