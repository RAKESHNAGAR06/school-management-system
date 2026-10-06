const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "teacher",
        "student",
        "parent",
      ],
      default: "student",
    },

    phone: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },
	
	tokenVersion: {
	  type: Number,
	  default: 0,
	},
  },
  {
    timestamps: true,
  }
);

// ==========================================
// HASH PASSWORD BEFORE SAVE
// ==========================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(
    this.password,
    10
  );
});

// ==========================================
// REMOVE SENSITIVE FIELDS FROM JSON
// ==========================================

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;

    return ret;
  },
});

// ==========================================
// REMOVE SENSITIVE FIELDS FROM OBJECT
// ==========================================

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;

    return ret;
  },
});

module.exports = mongoose.model(
  "User",
  userSchema
);