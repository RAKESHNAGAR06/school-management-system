const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    dateOfBirth: {
      type: Date,
    },

    className: {
      type: String,
      default: "",
    },

    section: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    // Main Parent relationship
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
    },

    // Legacy/snapshot fields.
    // Automatically maintained from Parent.
    parentName: {
      type: String,
      default: "",
    },

    parentPhone: {
      type: String,
      default: "",
    },

    admissionDate: {
      type: Date,
      default: Date.now,
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


studentSchema.index({
  isActive: 1,
  className: 1,
  section: 1,
});

studentSchema.index({
  className: 1,
  section: 1,
  rollNumber: 1,
});

studentSchema.index({
  parentId: 1,
});

module.exports = mongoose.model(
  "Student",
  studentSchema
);