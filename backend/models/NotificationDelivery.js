const mongoose = require("mongoose");

const notificationDeliverySchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    channel: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
    },

    recipient: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
	  type: String,
	  enum: [
		"pending",
		"accepted",
		"sent",
		"delivered",
		"read",
		"failed",
	  ],
	  default: "pending",
	},

	deliveredAt: {
	  type: Date,
	  default: null,
	},

	readAt: {
	  type: Date,
	  default: null,
	},

    providerMessageId: {
      type: String,
      default: "",
    },

    error: {
      type: String,
      default: "",
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastAttemptAt: {
      type: Date,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationDeliverySchema.index(
  {
    notificationId: 1,
    userId: 1,
    channel: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "NotificationDelivery",
  notificationDeliverySchema
);