const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

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

    date: {
	  type: Date,
	  required: true,
	  set: (value) => {
		if (!value) {
		  return value;
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
		  return value;
		}

		date.setHours(0, 0, 0, 0);

		return date;
	  },
	},

    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      default: "present",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  {
    studentId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

attendanceSchema.index({
  className: 1,
  section: 1,
  date: 1,
});

module.exports = mongoose.model("Attendance", attendanceSchema);