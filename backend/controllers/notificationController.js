const SchoolSetting = require("../models/SchoolSetting");
const {
  sendNotificationEmails,
  sendNotificationWhatsApps,
} = require(
  "../services/notificationDeliveryService"
);



const {
  buildNotificationVisibility,
} = require("../services/notificationVisibilityService");

const NotificationDelivery = require(
  "../models/NotificationDelivery"
);

const {
  sendEmail,
} = require("../services/emailService");

const {
  sendWhatsAppMessage,
} = require("../services/whatsappService");

const Notification = require("../models/Notification");
const NotificationRead = require("../models/NotificationRead");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const Class = require("../models/Class");


// ======================================
// ESCAPE HTML
// ======================================
const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};


// ======================================
// RETRY FAILED EMAIL
// Admin Only
// ======================================
const retryFailedEmail = async (req, res) => {
  try {
    const delivery =
      await NotificationDelivery.findOne({
        _id: req.params.id,
        channel: "email",
        status: "failed",
      }).populate("notificationId");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Failed email delivery not found",
      });
    }

    if (!delivery.notificationId) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    delivery.attempts += 1;
    delivery.lastAttemptAt = new Date();

    await delivery.save();

    try {
      const result = await sendEmail({
        to: delivery.recipient,

        subject:
          delivery.notificationId.title,

        text:
          delivery.notificationId.message,

        html: `
          <div style="font-family:Arial,sans-serif;">
            <h2>
              ${escapeHtml(
                delivery.notificationId.title
              )}
            </h2>

            <p style="white-space:pre-line;">
              ${escapeHtml(
                delivery.notificationId.message
              )}
            </p>
          </div>
        `,
      });

      delivery.status = "sent";

      delivery.providerMessageId =
        result.messageId || "";

      delivery.error = "";

      delivery.sentAt = new Date();

      await delivery.save();

      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        data: delivery,
      });

    } catch (emailError) {
      delivery.status = "failed";

      delivery.error =
        emailError.message;

      await delivery.save();

      return res.status(500).json({
        success: false,
        message: "Email retry failed",
        error: emailError.message,
      });
    }

  } catch (error) {
    console.error(
      "Retry failed email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// GET FAILED EMAIL DELIVERIES
// Admin Only
// ======================================
const getFailedEmailDeliveries = async (
  req,
  res
) => {
  try {
    const deliveries =
      await NotificationDelivery.find({
        channel: "email",
        status: "failed",
      })
        .populate(
          "userId",
          "name email role"
        )
        .populate(
          "notificationId",
          "title type"
        )
        .sort({
          updatedAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });

  } catch (error) {
    console.error(
      "Get failed emails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// CREATE NOTIFICATION
// Admin / Teacher
// ======================================
const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      targetType,
      targetRoles,
      className,
      section,
      targetUsers,
      channels,
    } = req.body;


    // ----------------------------------
    // BASIC VALIDATION
    // ----------------------------------

    if (!title || !message || !targetType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, message and target type are required",
      });
    }


    // ----------------------------------
    // ROLE TARGET VALIDATION
    // ----------------------------------

    if (
      targetType === "role" &&
      (!targetRoles ||
        targetRoles.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one target role",
      });
    }


    // ----------------------------------
    // CLASS TARGET VALIDATION
    // ----------------------------------

    if (
      targetType === "class" &&
      !className
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class is required for class notification",
      });
    }


    // ----------------------------------
    // USER TARGET VALIDATION
    // ----------------------------------

    if (
      targetType === "user" &&
      (!targetUsers ||
        targetUsers.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one user",
      });
    }


// ==================================
// TEACHER SECURITY
// ==================================

if (req.user.role === "teacher") {
  // ----------------------------------
  // 1. GET ACTIVE TEACHER ACCOUNT
  // ----------------------------------

  const teacherUser =
    await User.findOne({
      _id: req.user.userId,
      role: "teacher",
      isActive: true,
    }).select(
      "_id name email role"
    );

  if (!teacherUser) {
    return res.status(403).json({
      success: false,
      message:
        "Active teacher account is required",
    });
  }


  // ----------------------------------
  // 2. GET ACTIVE TEACHER PROFILE
  // ----------------------------------

  const teacher =
    await Teacher.findOne({
      email: teacherUser.email,
      isActive: true,
    }).select(
      "_id name email"
    );

  if (!teacher) {
    return res.status(403).json({
      success: false,
      message:
        "Active teacher profile not found",
    });
  }


  // ----------------------------------
  // 3. GET TEACHER ASSIGNED CLASSES
  // ----------------------------------

  const assignedClasses =
    await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select(
      "_id className section"
    );

  if (assignedClasses.length === 0) {
    return res.status(403).json({
      success: false,
      message:
        "No active class is assigned to this teacher",
    });
  }


  // ----------------------------------
  // 4. SCHOOL-WIDE TARGET BLOCK
  // ----------------------------------

  if (targetType === "all") {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot send school-wide notifications",
    });
  }


  // ----------------------------------
  // 5. ROLE-WIDE TARGET BLOCK
  // ----------------------------------

  /*
    "student" or "parent" role targeting
    means the whole school.

    Teachers must use:
    - class target
    - authorized individual users
  */

  if (targetType === "role") {
    return res.status(403).json({
      success: false,
      message:
        "Teachers cannot send role-wide notifications. Please select an assigned class or authorized users.",
    });
  }


  // ----------------------------------
  // 6. CLASS TARGET AUTHORIZATION
  // ----------------------------------

  if (targetType === "class") {
    const cleanClassName =
      String(
        className || ""
      ).trim();

    const cleanSection =
      String(
        section || ""
      ).trim();

    const hasClassAccess =
      assignedClasses.some(
        (assignedClass) =>
          String(
            assignedClass.className
          ).trim() ===
            cleanClassName &&
          String(
            assignedClass.section || ""
          ).trim() ===
            cleanSection
      );

    if (!hasClassAccess) {
      return res.status(403).json({
        success: false,
        message:
          "You can send class notifications only to your assigned classes",
      });
    }
  }


  // ----------------------------------
  // 7. INDIVIDUAL USER AUTHORIZATION
  // ----------------------------------

  if (
    targetType === "user" &&
    Array.isArray(targetUsers) &&
    targetUsers.length > 0
  ) {
    /*
      Find students belonging only to
      this teacher's assigned classes.
    */

    const classConditions =
      assignedClasses.map(
        (assignedClass) => ({
          className:
            assignedClass.className,

          section:
            assignedClass.section || "",
        })
      );

    const authorizedStudents =
      await Student.find({
        isActive: true,

        $or: classConditions,
      }).select(
        "_id email"
      );


    const authorizedStudentIds =
      authorizedStudents.map(
        (student) =>
          student._id
      );


    const authorizedStudentEmails =
      authorizedStudents
        .map((student) =>
          String(
            student.email || ""
          )
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);


    // ----------------------------------
    // LINKED PARENTS
    // ----------------------------------

    const authorizedParents =
      await Parent.find({
        isActive: true,

        studentId: {
          $in:
            authorizedStudentIds,
        },
      }).select(
        "_id email studentId"
      );


    const authorizedParentEmails =
      authorizedParents
        .map((parent) =>
          String(
            parent.email || ""
          )
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);


    // ----------------------------------
    // REQUESTED USER ACCOUNTS
    // ----------------------------------

    const requestedUsers =
      await User.find({
        _id: {
          $in: targetUsers,
        },

        isActive: true,
      }).select(
        "_id email role"
      );


    /*
      Prevent invalid / deleted / inactive
      IDs from silently passing.
    */

    if (
      requestedUsers.length !==
      targetUsers.length
    ) {
      return res.status(403).json({
        success: false,
        message:
          "One or more selected users are invalid or inactive",
      });
    }


    // ----------------------------------
    // VERIFY EVERY TARGET USER
    // ----------------------------------

    const unauthorizedUser =
      requestedUsers.find(
        (targetUser) => {
          const email =
            String(
              targetUser.email || ""
            )
              .trim()
              .toLowerCase();

          if (
            targetUser.role ===
            "student"
          ) {
            return (
              !authorizedStudentEmails.includes(
                email
              )
            );
          }

          if (
            targetUser.role ===
            "parent"
          ) {
            return (
              !authorizedParentEmails.includes(
                email
              )
            );
          }

          /*
            Admin / Teacher or any
            unexpected role is blocked.
          */

          return true;
        }
      );


    if (unauthorizedUser) {
      return res.status(403).json({
        success: false,
        message:
          "You can notify only students and parents belonging to your assigned classes",
      });
    }
  }
}


    // ==================================
    // CREATE NOTIFICATION
    // ==================================

    const notification =
      await Notification.create({

        title: title.trim(),

        message: message.trim(),

        type:
          type || "general",

        targetType,

        targetRoles:
          targetType === "role"
            ? targetRoles
            : [],

        className:
          targetType === "class"
            ? className
            : "",

        section:
          targetType === "class"
            ? section || ""
            : "",

        targetUsers:
          targetType === "user"
            ? targetUsers
            : [],

        createdBy:
          req.user.userId,

        channels: {

          inApp:
            channels?.inApp !== false,

          email:
            channels?.email === true,

          whatsapp:
            channels?.whatsapp === true,
        },
      });


    // ==================================
    // EMAIL DELIVERY
    // ==================================

    let emailDelivery = {
      total: 0,
      sent: 0,
      failed: 0,
    };


    if (notification.channels.email) {

      try {

        emailDelivery =
          await sendNotificationEmails(
            notification
          );

      } catch (error) {

        console.error(
          "Notification email delivery error:",
          error
        );

        emailDelivery = {
          total: 0,
          sent: 0,
          failed: 0,
          error: error.message,
        };
      }
    }
	
	let whatsappDelivery = {
  total: 0,
  sent: 0,
  failed: 0,
  skipped: 0,
};

if (notification.channels.whatsapp) {
  try {
    whatsappDelivery =
      await sendNotificationWhatsApps(
        notification
      );
  } catch (error) {
    console.error(
      "Notification WhatsApp delivery error:",
      error
    );

    whatsappDelivery = {
      total: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      error: error.message,
    };
  }
}


    return res.status(201).json({
  success: true,

  message:
    "Notification created successfully",

  data: notification,

  delivery: {
    email: emailDelivery,
    whatsapp: whatsappDelivery,
  },
});

  } catch (error) {

    console.error(
      "Create notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};


// ======================================
// GET CURRENT USER NOTIFICATIONS
// ======================================
const getMyNotifications = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      );


    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const conditions =
      await buildNotificationVisibility(
        user
      );


    const notifications =
      await Notification.find({

        isActive: true,

        "channels.inApp": true,

        $or: conditions,

      })
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });


    const ids =
      notifications.map(
        (notification) =>
          notification._id
      );


    const readRecords =
      await NotificationRead.find({

        userId: user._id,

        notificationId: {
          $in: ids,
        },

      }).select(
        "notificationId"
      );


    const readIds =
      new Set(
        readRecords.map(
          (record) =>
            record.notificationId.toString()
        )
      );


    const data =
      notifications.map(
        (notification) => ({

          ...notification.toObject(),

          isRead:
            readIds.has(
              notification._id.toString()
            ),
        })
      );


    const unreadCount =
      data.filter(
        (notification) =>
          !notification.isRead
      ).length;


    return res.status(200).json({
      success: true,
      count: data.length,
      unreadCount,
      data,
    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// MARK ONE NOTIFICATION AS READ
// ======================================
const markNotificationAsRead = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      );


    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const conditions =
      await buildNotificationVisibility(
        user
      );


    // Important:
    // User can only mark a notification
    // that they are actually allowed to see.

    const notification =
      await Notification.findOne({

        _id: req.params.id,

        isActive: true,

        "channels.inApp": true,

        $or: conditions,
      });


    if (!notification) {
      return res.status(403).json({
        success: false,

        message:
          "You do not have access to this notification",
      });
    }


    const read =
      await NotificationRead.findOneAndUpdate(

        {
          notificationId:
            notification._id,

          userId:
            user._id,
        },

        {
          $set: {
            readAt:
              new Date(),
          },
        },

        {
          new: true,
          upsert: true,
        }
      );


    return res.status(200).json({
      success: true,

      message:
        "Notification marked as read",

      data: read,
    });

  } catch (error) {

    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================
const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      );


    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const conditions =
      await buildNotificationVisibility(
        user
      );


    // Only visible notifications
    const notifications =
      await Notification.find({

        isActive: true,

        "channels.inApp": true,

        $or: conditions,

      }).select("_id");


    if (notifications.length === 0) {

      return res.status(200).json({
        success: true,

        message:
          "No notifications to mark as read",

        updatedCount: 0,

        unreadCount: 0,
      });
    }


    const now =
      new Date();


    const operations =
      notifications.map(
        (notification) => ({

          updateOne: {

            filter: {

              notificationId:
                notification._id,

              userId:
                user._id,
            },

            update: {

              $set: {
                readAt: now,
              },
            },

            upsert: true,
          },
        })
      );


    await NotificationRead.bulkWrite(
      operations
    );


    return res.status(200).json({

      success: true,

      message:
        "All notifications marked as read",

      updatedCount:
        notifications.length,

      unreadCount: 0,
    });

  } catch (error) {

    console.error(
      "Mark all notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// ADMIN - GET ALL NOTIFICATIONS
// ======================================
const getAllNotifications = async (
  req,
  res
) => {
  try {

    const notifications =
      await Notification.find()
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      count:
        notifications.length,

      data:
        notifications,
    });

  } catch (error) {

    console.error(
      "Get all notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// DELETE / DISABLE NOTIFICATION
// ======================================
const deleteNotification = async (
  req,
  res
) => {
  try {

    const notification =
      await Notification.findById(
        req.params.id
      );


    if (!notification) {
      return res.status(404).json({
        success: false,

        message:
          "Notification not found",
      });
    }


    // Admin can remove any notification.
    // Teacher can remove only own notification.

    if (
      req.user.role === "teacher" &&
      notification.createdBy.toString() !==
        req.user.userId
    ) {

      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }


    notification.isActive =
      false;


    await notification.save();


    return res.status(200).json({
      success: true,

      message:
        "Notification removed successfully",
    });

  } catch (error) {

    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================
// TEST EMAIL
// Temporary development route
// ======================================
const sendTestEmail = async (
  req,
  res
) => {
  try {

    const {
      email,
    } = req.body;


    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }


    const result =
      await sendEmail({

        to:
          email.trim().toLowerCase(),

        subject:
          "School Management System - Email Test",

        text:
          "Your School Management System email notification service is working successfully.",

        html: `
          <div style="font-family:Arial,sans-serif;">

            <h2>
              Email Notification Test
            </h2>

            <p>
              Your School Management System email
              notification service is working successfully.
            </p>

            <p>
              You can now receive school notifications
              through email.
            </p>

          </div>
        `,
      });


    return res.status(200).json({
      success: true,

      message:
        "Test email sent successfully",

      messageId:
        result.messageId,
    });

  } catch (error) {

    console.error(
      "Test email error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to send test email",

      error:
        error.message,
    });
  }
};



const sendTestWhatsApp = async (
  req,
  res
) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is required",
      });
    }

    const result = await sendWhatsAppMessage({
  to: phone,

  templateName: "school_notification",

  languageCode: "en",

  parameters: [
    "Student",
    "Exam Schedule Update",
    "Your examination schedule has been updated. Please check the school portal for complete details.",
    "ABC Public School",
  ],
});

    return res.status(200).json({
      success: true,

      message:
        "WhatsApp test message sent successfully",

      messageId:
        result.messageId,
    });
  } catch (error) {
    console.error(
      "WhatsApp test error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to send WhatsApp test message",

      error:
        error.message,
    });
  }
};


const getFailedWhatsAppDeliveries = async (
  req,
  res
) => {
  try {
    const deliveries =
      await NotificationDelivery.find({
        channel: "whatsapp",
        status: "failed",
      })
        .populate(
          "userId",
          "name email phone role"
        )
        .populate(
          "notificationId",
          "title type"
        )
        .sort({
          updatedAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });

  } catch (error) {
    console.error(
      "Get failed WhatsApp deliveries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const retryFailedWhatsApp = async (req, res) => {
  try {
    const delivery =
      await NotificationDelivery.findOne({
        _id: req.params.id,
        channel: "whatsapp",
        status: "failed",
      })
        .populate(
          "notificationId",
          "title message"
        )
        .populate(
          "userId",
          "name phone"
        );

    // Delivery not found
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message:
          "Failed WhatsApp delivery not found",
      });
    }

    // Original notification removed/not found
    if (!delivery.notificationId) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // -----------------------------------
    // USE LATEST USER PHONE
    // -----------------------------------
    const retryPhone = String(
      delivery.userId?.phone ||
        delivery.recipient ||
        ""
    ).replace(/\D/g, "");

    if (!retryPhone) {
      return res.status(400).json({
        success: false,
        message:
          "User WhatsApp number not found",
      });
    }

    // Update old stored recipient
    delivery.recipient = retryPhone;

    // Increase attempt count
    delivery.attempts =
      (delivery.attempts || 0) + 1;

    delivery.lastAttemptAt =
      new Date();

    await delivery.save();

    try {
      // -----------------------------------
      // GET SCHOOL NAME
      // -----------------------------------
      const settings =
        await SchoolSetting.findOne();

      const schoolName =
        settings?.schoolName ||
        "School Management System";

      console.log(
        "Retrying WhatsApp:",
        delivery.userId?.name,
        retryPhone
      );

      // -----------------------------------
      // SEND WHATSAPP
      // -----------------------------------
      const result =
        await sendWhatsAppMessage({
          to: retryPhone,

          templateName:
            "school_notification",

          languageCode: "en",

          parameters: [
            delivery.userId?.name ||
              "Student/Parent",

            delivery.notificationId?.title ||
              "School Notification",

            delivery.notificationId?.message ||
              "Please check the school portal.",

            schoolName,
          ],
        });

      // -----------------------------------
      // SUCCESS
      // -----------------------------------
      delivery.status = "sent";

      delivery.providerMessageId =
        result.messageId || "";

      delivery.error = "";

      delivery.sentAt =
        new Date();

      await delivery.save();

      console.log(
        `WhatsApp retry successful for ${retryPhone}`
      );

      return res.status(200).json({
        success: true,

        message:
          "WhatsApp message sent successfully",

        data: delivery,
      });
    } catch (whatsappError) {
      // -----------------------------------
      // FAILED
      // -----------------------------------
      delivery.status = "failed";

      delivery.error =
        whatsappError.message;

      delivery.sentAt = null;

      await delivery.save();

      console.error(
        `WhatsApp retry failed for ${retryPhone}:`,
        whatsappError.message
      );

      return res.status(500).json({
        success: false,

        message:
          "WhatsApp retry failed",

        error:
          whatsappError.message,
      });
    }
  } catch (error) {
    console.error(
      "Retry WhatsApp error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ======================================
// EXPORT CONTROLLERS
// ======================================
module.exports = {

  createNotification,

  getMyNotifications,

  markNotificationAsRead,

  markAllNotificationsAsRead,

  getAllNotifications,

  deleteNotification,

  sendTestEmail,

  retryFailedEmail,

  getFailedEmailDeliveries,
  
  sendTestWhatsApp,
  
  getFailedWhatsAppDeliveries,

  retryFailedWhatsApp,
};