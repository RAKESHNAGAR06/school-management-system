const Notification = require(
  "../models/Notification"
);

const User = require(
  "../models/User"
);

const Student = require("../models/Student");
const Parent = require("../models/Parent");

const {
  sendNotificationEmails,
  sendNotificationWhatsApps,
} = require(
  "./notificationDeliveryService"
);

// ==========================================
// VALID NOTIFICATION TYPES
// ==========================================

const VALID_TYPES = [
  "general",
  "exam",
  "result",
  "homework",
  "fee",
  "attendance",
  "timetable",
  "event",
  "holiday",
  "emergency",
];

const VALID_TARGET_TYPES = [
  "all",
  "role",
  "class",
  "user",
];

// ==========================================
// CREATE + DELIVER NOTIFICATION
// ==========================================

const createAndDeliverNotification =
  async ({
    title,
    message,

    type = "general",

    targetType = "all",

    targetRoles = [],

    className = "",

    section = "",

    targetUsers = [],

    createdBy,

    channels = {
      inApp: true,
      email: false,
      whatsapp: false,
    },
  }) => {
    // --------------------------------------
    // Basic validation
    // --------------------------------------

    if (!title?.trim()) {
      throw new Error(
        "Notification title is required"
      );
    }

    if (!message?.trim()) {
      throw new Error(
        "Notification message is required"
      );
    }

    if (!createdBy) {
      throw new Error(
        "Notification createdBy is required"
      );
    }

    if (!VALID_TYPES.includes(type)) {
      throw new Error(
        `Invalid notification type: ${type}`
      );
    }

    if (
      !VALID_TARGET_TYPES.includes(
        targetType
      )
    ) {
      throw new Error(
        `Invalid target type: ${targetType}`
      );
    }

    // --------------------------------------
    // Validate creator
    // --------------------------------------

    const creator =
      await User.findById(
        createdBy
      ).select(
        "_id role isActive"
      );

    if (!creator) {
      throw new Error(
        "Notification creator not found"
      );
    }

    if (!creator.isActive) {
      throw new Error(
        "Notification creator account is inactive"
      );
    }

    // --------------------------------------
    // Target validation
    // --------------------------------------

    if (
      targetType === "role" &&
      (!Array.isArray(targetRoles) ||
        targetRoles.length === 0)
    ) {
      throw new Error(
        "At least one target role is required"
      );
    }

    if (
      targetType === "class" &&
      !className?.trim()
    ) {
      throw new Error(
        "Class name is required for class notification"
      );
    }

    if (
      targetType === "user" &&
      (!Array.isArray(targetUsers) ||
        targetUsers.length === 0)
    ) {
      throw new Error(
        "At least one target user is required"
      );
    }

    // --------------------------------------
    // Normalize channels
    // --------------------------------------

    const normalizedChannels = {
      inApp:
        channels?.inApp !== false,

      email:
        Boolean(channels?.email),

      whatsapp:
        Boolean(
          channels?.whatsapp
        ),
    };

    if (
      !normalizedChannels.inApp &&
      !normalizedChannels.email &&
      !normalizedChannels.whatsapp
    ) {
      throw new Error(
        "At least one notification channel is required"
      );
    }

    // --------------------------------------
    // Normalize targets
    // --------------------------------------

    const normalizedTargetRoles =
      targetType === "role"
        ? [
            ...new Set(
              targetRoles.filter(
                Boolean
              )
            ),
          ]
        : [];

    const normalizedTargetUsers =
      targetType === "user"
        ? [
            ...new Set(
              targetUsers
                .filter(Boolean)
                .map((id) =>
                  id.toString()
                )
            ),
          ]
        : [];

    // --------------------------------------
    // Create Notification
    // --------------------------------------

    const notification =
      await Notification.create({
        title: title.trim(),

        message: message.trim(),

        type,

        targetType,

        targetRoles:
          normalizedTargetRoles,

        className:
          targetType === "class"
            ? className.trim()
            : "",

        section:
          targetType === "class"
            ? section?.trim() || ""
            : "",

        targetUsers:
          normalizedTargetUsers,

        createdBy,

        channels:
          normalizedChannels,

        isActive: true,
      });

    // --------------------------------------
    // Delivery result
    // --------------------------------------

    const delivery = {
      email: null,
      whatsapp: null,
    };

    // --------------------------------------
    // EMAIL
    // --------------------------------------

    if (
      normalizedChannels.email
    ) {
      try {
        delivery.email =
          await sendNotificationEmails(
            notification
          );
      } catch (error) {
        console.error(
          "Automatic notification email delivery error:",
          error
        );

        delivery.email = {
          total: 0,
          sent: 0,
          failed: 0,
          error: error.message,
        };
      }
    }

    // --------------------------------------
    // WHATSAPP
    // --------------------------------------

    if (
      normalizedChannels.whatsapp
    ) {
      try {
        delivery.whatsapp =
          await sendNotificationWhatsApps(
            notification
          );
      } catch (error) {
        console.error(
          "Automatic notification WhatsApp delivery error:",
          error
        );

        delivery.whatsapp = {
          total: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
          error: error.message,
        };
      }
    }

    // --------------------------------------
    // RETURN
    // --------------------------------------

    return {
      notification,
      delivery,
    };
  };

// ==========================================
// SAFE VERSION
// ==========================================

/*
  Use this inside Exam / Result / Homework /
  Attendance / Fee controllers.

  Main module operation should NOT fail only
  because Email or WhatsApp notification failed.
*/

const createAutomaticNotification =
  async (options) => {
    try {
      return await createAndDeliverNotification(
        options
      );
    } catch (error) {
      console.error(
        "Automatic notification error:",
        error
      );

      return {
        notification: null,

        delivery: {
          email: null,
          whatsapp: null,
        },

        error: error.message,
      };
    }
  };
  
  
    // ==========================================
	// GET STUDENT + PARENT USER IDS
	// ==========================================

	const getStudentAndParentUserIds = async (studentId) => {
	  try {
		const student = await Student.findById(studentId);

		if (!student) {
		  return [];
		}

		const emails = [];

		if (student.email) {
		  emails.push(
			student.email.toLowerCase().trim()
		  );
		}

		const parent = await Parent.findOne({
		  studentId: student._id,
		  isActive: true,
		});

		if (parent?.email) {
		  emails.push(
			parent.email.toLowerCase().trim()
		  );
		}

		if (emails.length === 0) {
		  return [];
		}

		const users = await User.find({
		  email: {
			$in: [...new Set(emails)],
		  },
		  role: {
			$in: ["student", "parent"],
		  },
		  isActive: true,
		}).select("_id");

		return users.map((user) =>
		  user._id.toString()
		);
	  } catch (error) {
		console.error(
		  "Student/Parent notification recipient error:",
		  error
		);

		return [];
	  }
	};

module.exports = {
  createAndDeliverNotification,
  createAutomaticNotification,
  getStudentAndParentUserIds,
};