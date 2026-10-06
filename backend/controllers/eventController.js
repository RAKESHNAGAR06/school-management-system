const Event = require("../models/Event");
const User = require("../models/User");
const Student = require("../models/Student");
const Parent = require("../models/Parent");

const {
  createAutomaticNotification,
} = require("../services/notificationService");

// ==========================================
// HELPERS
// ==========================================

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNotificationType = (event) => {
  return event.type === "holiday"
    ? "holiday"
    : "event";
};

const getNotificationTitle = (
  event,
  action
) => {
  const label =
    event.type === "holiday"
      ? "Holiday"
      : "Event";

  if (action === "created") {
    return `New ${label} Announcement`;
  }

  if (action === "updated") {
    return `${label} Updated`;
  }

  return `${label} Cancelled`;
};

const sendEventNotification = async (
  event,
  createdBy,
  action
) => {
  const message = [
    `${event.type === "holiday" ? "Holiday" : "Event"}: ${event.title}`,

    `Start Date: ${formatDate(
      event.startDate
    )}`,

    `End Date: ${formatDate(
      event.endDate
    )}`,

    event.startTime
      ? `Start Time: ${event.startTime}`
      : "",

    event.endTime
      ? `End Time: ${event.endTime}`
      : "",

    event.location
      ? `Location: ${event.location}`
      : "",

    event.description
      ? `Details: ${event.description}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const notificationData = {
    title: getNotificationTitle(
      event,
      action
    ),

    message,

    type:
      getNotificationType(event),

    targetType:
      event.targetType,

    createdBy,

    channels: {
      inApp: true,
      email: true,
      whatsapp: true,
    },
  };

  if (
    event.targetType === "role"
  ) {
    notificationData.targetRoles =
      event.targetRoles;
  }

  if (
    event.targetType === "class"
  ) {
    notificationData.className =
      event.className;

    notificationData.section =
      event.section || "";
  }

  await createAutomaticNotification(
    notificationData
  );
};

// ==========================================
// ADD EVENT / HOLIDAY
// ==========================================

const addEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      targetType,
      targetRoles,
      className,
      section,
    } = req.body;

    if (
      !title ||
      !type ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, type, start date and end date are required",
      });
    }

    if (
      !["event", "holiday"].includes(
        type
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event type",
      });
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    const finalTargetType =
      targetType || "all";

    if (
      ![
        "all",
        "role",
        "class",
      ].includes(finalTargetType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid target type",
      });
    }

    if (
      finalTargetType === "role" &&
      (!Array.isArray(targetRoles) ||
        targetRoles.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Select at least one target role",
      });
    }

    if (
      finalTargetType === "class" &&
      !className
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class is required for class notification",
      });
    }

    const event =
      await Event.create({
        title,
        description:
          description || "",

        type,

        startDate: start,
        endDate: end,

        startTime:
          startTime || "",

        endTime:
          endTime || "",

        location:
          location || "",

        targetType:
          finalTargetType,

        targetRoles:
          finalTargetType === "role"
            ? targetRoles
            : [],

        className:
          finalTargetType === "class"
            ? className
            : "",

        section:
          finalTargetType === "class"
            ? section || ""
            : "",

        createdBy:
          req.user.userId,
      });

    await sendEventNotification(
      event,
      req.user.userId,
      "created"
    );

    return res.status(201).json({
      success: true,

      message:
        type === "holiday"
          ? "Holiday added successfully"
          : "Event added successfully",

      data: event,
    });
  } catch (error) {
    console.error(
      "Add event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL
// ==========================================

const getEvents = async (
  req,
  res
) => {
  try {
    const events =
      await Event.find({
        isActive: true,
      })
        .populate(
          "createdBy",
          "name role"
        )
        .sort({
          startDate: 1,
        });

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET BY ID
// ==========================================

const getEventById = async (
  req,
  res
) => {
  try {
    const event =
      await Event.findById(
        req.params.id
      ).populate(
        "createdBy",
        "name role"
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event/Holiday not found",
      });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE
// ==========================================

const updateEvent = async (
  req,
  res
) => {
  try {
    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event/Holiday not found",
      });
    }

    const oldTarget = {
      targetType:
        event.targetType,

      targetRoles: [
        ...(event.targetRoles || []),
      ],

      className:
        event.className,

      section:
        event.section,
    };

    const allowedFields = [
      "title",
      "description",
      "type",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
      "location",
      "targetType",
      "targetRoles",
      "className",
      "section",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          event[field] =
            req.body[field];
        }
      }
    );

    if (
      ![
        "event",
        "holiday",
      ].includes(event.type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid event type",
      });
    }

    if (
      new Date(event.endDate) <
      new Date(event.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    if (
      ![
        "all",
        "role",
        "class",
      ].includes(
        event.targetType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid target type",
      });
    }

    if (
      event.targetType === "role" &&
      (!Array.isArray(
        event.targetRoles
      ) ||
        event.targetRoles.length ===
          0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Select at least one target role",
      });
    }

    if (
      event.targetType === "class" &&
      !event.className
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class is required",
      });
    }

    if (
      event.targetType !== "role"
    ) {
      event.targetRoles = [];
    }

    if (
      event.targetType !== "class"
    ) {
      event.className = "";
      event.section = "";
    }

    await event.save();

    /*
      If audience changed, old audience
      should know that their previous
      announcement changed.
    */
    const audienceChanged =
      oldTarget.targetType !==
        event.targetType ||
      oldTarget.className !==
        event.className ||
      oldTarget.section !==
        event.section ||
      JSON.stringify(
        [...oldTarget.targetRoles].sort()
      ) !==
        JSON.stringify(
          [
            ...(event.targetRoles ||
              []),
          ].sort()
        );

    if (audienceChanged) {
      const oldNotification = {
        title:
          "Announcement Updated",

        message:
          `${event.title} has been updated and may no longer apply to your group. Please check the latest school announcements.`,

        type:
          getNotificationType(
            event
          ),

        targetType:
          oldTarget.targetType,

        createdBy:
          req.user.userId,

        channels: {
          inApp: true,
          email: true,
          whatsapp: true,
        },
      };

      if (
        oldTarget.targetType ===
        "role"
      ) {
        oldNotification.targetRoles =
          oldTarget.targetRoles;
      }

      if (
        oldTarget.targetType ===
        "class"
      ) {
        oldNotification.className =
          oldTarget.className;

        oldNotification.section =
          oldTarget.section || "";
      }

      await createAutomaticNotification(
        oldNotification
      );
    }

    await sendEventNotification(
      event,
      req.user.userId,
      "updated"
    );

    return res.json({
      success: true,
      message:
        "Event/Holiday updated successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "Update event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE / CANCEL
// ==========================================

const deleteEvent = async (
  req,
  res
) => {
  try {
    const event =
      await Event.findById(
        req.params.id
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event/Holiday not found",
      });
    }

    await Event.findByIdAndDelete(
      req.params.id
    );

    await sendEventNotification(
      event,
      req.user.userId,
      "deleted"
    );

    return res.json({
      success: true,
      message:
        "Event/Holiday deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete event error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    let visibilityConditions = [
      {
        targetType: "all",
      },
      {
        targetType: "role",
        targetRoles: user.role,
      },
    ];

    // Student class events
    if (user.role === "student") {
      const student = await Student.findOne({
        email: user.email,
        isActive: true,
      });

      if (student) {
        visibilityConditions.push({
          targetType: "class",
          className: student.className,
          $or: [
            { section: student.section },
            { section: "" },
          ],
        });
      }
    }

    // Parent child class events
    if (user.role === "parent") {
      const parent = await Parent.findOne({
        email: user.email,
        isActive: true,
      }).populate("studentId");

      if (parent?.studentId) {
        visibilityConditions.push({
          targetType: "class",
          className: parent.studentId.className,
          $or: [
            {
              section: parent.studentId.section,
            },
            {
              section: "",
            },
          ],
        });
      }
    }

    /*
      Admin can see everything.
      Teacher currently sees:
      - all
      - teacher role events

      Class-specific teacher event support can
      later use teacher/class assignment.
    */
    const filter =
      user.role === "admin"
        ? {
            isActive: true,
          }
        : {
            isActive: true,
            $or: visibilityConditions,
          };

    const events = await Event.find(filter)
      .populate("createdBy", "name role")
      .sort({
        startDate: 1,
        startTime: 1,
      });

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get my events error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};