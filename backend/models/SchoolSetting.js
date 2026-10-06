const mongoose = require("mongoose");


const schoolSettingSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    principalName: {
      type: String,
      default: "",
      trim: true,
    },

    academicSession: {
      type: String,
      default: "",
      trim: true,
    },

    schoolCode: {
      type: String,
      default: "",
      trim: true,
    },

    affiliationNumber: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },
		logoPublicId: {
	  type: String,
	  default: "",
	  trim: true,
	},
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SchoolSetting",
  schoolSettingSchema
);