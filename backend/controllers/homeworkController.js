const Homework = require(
  "../models/Homework"
);

const User = require(
  "../models/User"
);

const Student = require(
  "../models/Student"
);

const Parent = require(
  "../models/Parent"
);

const {
  createAutomaticNotification,
} = require(
  "../services/notificationService"
);

// ==========================================
// HELPERS
// ==========================================

const normalizeClassName = (
  value = ""
) => {
  return value
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/st|nd|rd|th/g, "");
};

const formatDueDate = (
  dateValue
) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(
    dateValue
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ==========================================
// ADD HOMEWORK
// ==========================================

const addHomework = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      className,
      section,
      subjectName,
      dueDate,
    } = req.body;

    if (
      !title ||
      !className ||
      !subjectName ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, class, subject and due date are required",
      });
    }

    // ==========================================
    // ACTIVE TEACHER CHECK
    // ==========================================

    const user =
      await User.findOne({
        _id: req.user.userId,
        role: "teacher",
        isActive: true,
      }).select(
        "_id email name"
      );

    if (!user) {
      return res.status(403).json({
        success: false,
        message:
          "Active teacher account is required to assign homework",
      });
    }

    const teacher =
      await Teacher.findOne({
        email: user.email,
        isActive: true,
      }).select(
        "_id name email subject"
      );

    if (!teacher) {
      return res.status(403).json({
        success: false,
        message:
          "Active teacher profile not found",
      });
    }

    const cleanTitle =
      String(title).trim();

    const cleanSubject =
      String(subjectName).trim();

    if (
      !cleanTitle ||
      !cleanSubject
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title and subject are required",
      });
    }

    const notificationClassName =
      String(className).trim();

    const homework =
      await Homework.create({
        title: cleanTitle,

        description:
          typeof description ===
          "string"
            ? description.trim()
            : "",

        className:
          normalizeClassName(
            notificationClassName
          ),

        section:
          typeof section ===
          "string"
            ? section.trim()
            : "",

        subjectName:
          cleanSubject,

        dueDate,

        assignedBy:
          req.user.userId,
      });

    const formattedDueDate =
      formatDueDate(
        homework.dueDate
      );

    const details = [
      `Homework: ${homework.title}`,
      `Subject: ${homework.subjectName}`,

      formattedDueDate
        ? `Due Date: ${formattedDueDate}`
        : "",

      homework.description
        ? `Details: ${homework.description}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await createAutomaticNotification({
      title:
        "New Homework Assigned",

      message: details,

      type: "homework",

      targetType: "class",

      className:
        notificationClassName,

      section:
        homework.section || "",

      createdBy:
        req.user.userId,

      channels: {
        inApp: true,
        email: true,
        whatsapp: true,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Homework added successfully",
      data: homework,
    });
  } catch (error) {
    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Add homework error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add homework",
    });
  }
};

// ==========================================
// TEACHER HOMEWORK
// ==========================================

const getTeacherHomework =
  async (req, res) => {
    try {
      const homework =
        await Homework.find({
          assignedBy:
            req.user.userId,
        }).sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        data: homework,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// STUDENT HOMEWORK
// ==========================================

const getStudentHomework =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found",
        });
      }

      const student =
        await Student.findOne({
          email: user.email,
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found",
        });
      }

      const normalizedStudentClass =
        normalizeClassName(
          student.className
        );

      const homework =
        await Homework.find({
          section:
            student.section,

          isActive: true,
        }).sort({
          dueDate: 1,
        });

      const filteredHomework =
        homework.filter(
          (item) =>
            normalizeClassName(
              item.className
            ) ===
            normalizedStudentClass
        );

      return res.json({
        success: true,
        data: filteredHomework,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// PARENT HOMEWORK
// ==========================================

const getParentHomework =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User account not found",
        });
      }

      const parent =
        await Parent.findOne({
          email: user.email,
        }).populate(
          "studentId"
        );

      if (
        !parent ||
        !parent.studentId
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Linked student not found",
        });
      }

      const student =
        parent.studentId;

      const homework =
        await Homework.find({
          section:
            student.section,

          isActive: true,
        }).sort({
          dueDate: 1,
        });

      const normalizedStudentClass =
        normalizeClassName(
          student.className
        );

      const filteredHomework =
        homework.filter(
          (item) =>
            normalizeClassName(
              item.className
            ) ===
            normalizedStudentClass
        );

      return res.json({
        success: true,
        data: filteredHomework,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// UPDATE HOMEWORK
// ==========================================

const updateHomework = async (
  req,
  res
) => {
  try {
    const homework =
      await Homework.findById(
        req.params.id
      );

    if (!homework) {
      return res.status(404).json({
        success: false,
        message:
          "Homework not found",
      });
    }

    if (
      String(
        homework.assignedBy
      ) !==
      String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can update only your own homework",
      });
    }

    // ==========================================
    // ACTIVE TEACHER CHECK
    // ==========================================

    const user =
      await User.findOne({
        _id: req.user.userId,
        role: "teacher",
        isActive: true,
      }).select(
        "_id email name"
      );

    if (!user) {
      return res.status(403).json({
        success: false,
        message:
          "Active teacher account is required to update homework",
      });
    }

    const teacher =
      await Teacher.findOne({
        email: user.email,
        isActive: true,
      }).select("_id");

    if (!teacher) {
      return res.status(403).json({
        success: false,
        message:
          "Active teacher profile not found",
      });
    }

    const {
      title,
      description,
      className,
      section,
      subjectName,
      dueDate,
    } = req.body;

    const notificationClassName =
      className
        ? String(
            className
          ).trim()
        : homework.className;

    if (
      title !== undefined
    ) {
      const cleanTitle =
        String(title).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Homework title cannot be empty",
        });
      }

      homework.title =
        cleanTitle;
    }

    if (
      description !== undefined
    ) {
      homework.description =
        typeof description ===
        "string"
          ? description.trim()
          : "";
    }

    if (
      className !== undefined
    ) {
      const cleanClass =
        String(
          className
        ).trim();

      if (!cleanClass) {
        return res.status(400).json({
          success: false,
          message:
            "Class cannot be empty",
        });
      }

      homework.className =
        normalizeClassName(
          cleanClass
        );
    }

    if (
      section !== undefined
    ) {
      homework.section =
        typeof section ===
        "string"
          ? section.trim()
          : "";
    }

    if (
      subjectName !== undefined
    ) {
      const cleanSubject =
        String(
          subjectName
        ).trim();

      if (!cleanSubject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject cannot be empty",
        });
      }

      homework.subjectName =
        cleanSubject;
    }

    if (
      dueDate !== undefined
    ) {
      homework.dueDate =
        dueDate;
    }

    await homework.save();

    const formattedDueDate =
      formatDueDate(
        homework.dueDate
      );

    const details = [
      `Homework: ${homework.title}`,
      `Subject: ${homework.subjectName}`,

      formattedDueDate
        ? `Due Date: ${formattedDueDate}`
        : "",

      "Homework details have been updated.",
    ]
      .filter(Boolean)
      .join("\n");

    await createAutomaticNotification({
      title:
        "Homework Updated",

      message: details,

      type: "homework",

      targetType: "class",

      className:
        notificationClassName,

      section:
        homework.section || "",

      createdBy:
        req.user.userId,

      channels: {
        inApp: true,
        email: true,
        whatsapp: true,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Homework updated successfully",
      data: homework,
    });
  } catch (error) {
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid homework ID",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Update homework error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update homework",
    });
  }
};

// ==========================================
// DELETE HOMEWORK
// ==========================================

const deleteHomework = async (
  req,
  res
) => {
  try {
    const homework =
      await Homework.findById(
        req.params.id
      );

    if (!homework) {
      return res.status(404).json({
        success: false,
        message:
          "Homework not found",
      });
    }

    // Admin can delete any homework
    if (
      req.user.role === "admin"
    ) {
      await Homework.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        success: true,
        message:
          "Homework deleted successfully",
      });
    }

    // Teacher can delete only own homework
    if (
      req.user.role ===
        "teacher" &&
      homework.assignedBy.toString() ===
        req.user.userId
    ) {
      await Homework.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        success: true,
        message:
          "Homework deleted successfully",
      });
    }

    return res.status(403).json({
      success: false,
      message:
        "You are not allowed to delete this homework",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN - ALL HOMEWORK
// ==========================================

const getAllHomework = async (
  req,
  res
) => {
  try {
    const homework =
      await Homework.find({
        isActive: true,
      })
        .populate(
          "assignedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      count: homework.length,
      data: homework,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addHomework,
  getTeacherHomework,
  getStudentHomework,
  getParentHomework,
  deleteHomework,
  updateHomework,
  getAllHomework,
};