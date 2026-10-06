const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
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

    feeType: {
      type: String,
      enum: ["tuition", "admission", "exam", "transport", "other"],
      default: "tuition",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueDate: {
      type: Date,
    },

    paymentDate: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online", "upi", "card", "bank"],
      default: "cash",
    },

    status: {
      type: String,
      enum: ["paid", "partial", "pending"],
      default: "pending",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

feeSchema.index({
  studentId: 1,
  status: 1,
});

feeSchema.index({
  studentId: 1,
  dueDate: 1,
});

module.exports = mongoose.model("Fee", feeSchema);