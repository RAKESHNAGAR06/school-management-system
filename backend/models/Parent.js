const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
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

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    relation: {
      type: String,
      enum: ["father", "mother", "guardian"],
      default: "father",
    },

    occupation: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
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


parentSchema.index(
  {
    studentId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      studentId: {
        $type: "objectId",
      },
    },
  }
);

parentSchema.index({
  isActive: 1,
});

module.exports = mongoose.model(
  "Parent",
  parentSchema
);