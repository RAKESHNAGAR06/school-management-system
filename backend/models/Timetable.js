const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
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
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    teacherName: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    roomNumber: {
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

timetableSchema.index({
  className: 1,
  section: 1,
  day: 1,
  isActive: 1,
});

timetableSchema.index({
  teacherName: 1,
  day: 1,
  isActive: 1,
});

timetableSchema.index({
  roomNumber: 1,
  day: 1,
  isActive: 1,
});

module.exports = mongoose.model("Timetable", timetableSchema);