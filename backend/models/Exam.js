const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },

    examType: {
      type: String,
      enum: ["unit-test", "mid-term", "final", "pre-board", "other"],
      default: "unit-test",
    },

    className: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      default: "",
      trim: true,
    },

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

examSchema.index({
  className: 1,
  section: 1,
  examDate: 1,
});

examSchema.index({
  examDate: 1,
});

module.exports = mongoose.model("Exam", examSchema);