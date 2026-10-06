const Exam = require("../models/Exam");

const {
  createAutomaticNotification,
} = require("../services/notificationService");

// ==========================================
// DATE FORMAT HELPER
// ==========================================

const formatExamDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// ADD EXAM
// ==========================================

const addExam = async (
  req,
  res
) => {
  try {
    const {
      examName,
      className,
      section,
      subjectName,
      examDate,
      startTime,
      endTime,
      totalMarks,
    } = req.body;

    if (
      !examName ||
      !className ||
      !subjectName ||
      !examDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam name, class, subject and exam date are required",
      });
    }

    const parsedTotalMarks =
      totalMarks !== undefined
        ? Number(totalMarks)
        : undefined;

    if (
      parsedTotalMarks !==
        undefined &&
      (
        Number.isNaN(
          parsedTotalMarks
        ) ||
        parsedTotalMarks < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total marks must be a valid non-negative number",
      });
    }

    const examData = {
      examName:
        String(
          examName
        ).trim(),

      className:
        String(
          className
        ).trim(),

      section:
        typeof section ===
        "string"
          ? section.trim()
          : "",

      subjectName:
        String(
          subjectName
        ).trim(),

      examDate,

      startTime:
        typeof startTime ===
        "string"
          ? startTime.trim()
          : "",

      endTime:
        typeof endTime ===
        "string"
          ? endTime.trim()
          : "",
    };

    if (
      parsedTotalMarks !==
      undefined
    ) {
      examData.totalMarks =
        parsedTotalMarks;
    }

    const exam =
      await Exam.create(
        examData
      );

    const formattedDate =
      formatExamDate(
        exam.examDate
      );

    const details = [
      exam.examName
        ? `Exam: ${exam.examName}`
        : "",

      exam.subjectName
        ? `Subject: ${exam.subjectName}`
        : "",

      formattedDate
        ? `Date: ${formattedDate}`
        : "",

      exam.startTime
        ? `Time: ${exam.startTime}`
        : "",

      exam.totalMarks !==
      undefined
        ? `Total Marks: ${exam.totalMarks}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await createAutomaticNotification({
      title:
        "New Exam Scheduled",

      message:
        details ||
        "A new examination has been scheduled. Please check the school portal for details.",

      type: "exam",

      targetType: "class",

      className:
        exam.className,

      section:
        exam.section || "",

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
        "Exam added successfully",
      data: exam,
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
      "Add exam error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add exam",
    });
  }
};

// ==========================================
// GET ALL EXAMS
// ==========================================

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({
      examDate: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET EXAM BY ID
// ==========================================

const getExamById = async (
  req,
  res
) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE EXAM
// ==========================================

const updateExam = async (
  req,
  res
) => {
  try {
    const exam =
      await Exam.findById(
        req.params.id
      );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "Exam not found",
      });
    }

    const allowedFields = [
      "examName",
      "className",
      "section",
      "subjectName",
      "examDate",
      "startTime",
      "endTime",
      "totalMarks",
    ];

    for (
      const field of
      allowedFields
    ) {
      if (
        req.body[field] !==
        undefined
      ) {
        exam[field] =
          req.body[field];
      }
    }

    if (
      req.body.examName !==
      undefined
    ) {
      exam.examName =
        String(
          req.body.examName
        ).trim();
    }

    if (
      req.body.className !==
      undefined
    ) {
      exam.className =
        String(
          req.body.className
        ).trim();
    }

    if (
      req.body.section !==
      undefined
    ) {
      exam.section =
        String(
          req.body.section || ""
        ).trim();
    }

    if (
      req.body.subjectName !==
      undefined
    ) {
      exam.subjectName =
        String(
          req.body.subjectName
        ).trim();
    }

    if (
      req.body.totalMarks !==
      undefined
    ) {
      const total =
        Number(
          req.body.totalMarks
        );

      if (
        Number.isNaN(total) ||
        total < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total marks must be a valid non-negative number",
        });
      }

      exam.totalMarks =
        total;
    }

    await exam.save();

    const examDate =
      formatExamDate(
        exam.examDate
      );

    const details = [
      exam.examName
        ? `Exam: ${exam.examName}`
        : "",

      exam.subjectName
        ? `Subject: ${exam.subjectName}`
        : "",

      examDate
        ? `Date: ${examDate}`
        : "",

      exam.startTime
        ? `Time: ${exam.startTime}`
        : "",

      "The examination details have been updated.",
    ]
      .filter(Boolean)
      .join("\n");

    await createAutomaticNotification({
      title:
        "Exam Schedule Updated",

      message: details,

      type: "exam",

      targetType: "class",

      className:
        exam.className,

      section:
        exam.section || "",

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
        "Exam updated successfully",
      data: exam,
    });
  } catch (error) {
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam ID",
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
      "Update exam error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update exam",
    });
  }
};

// ==========================================
// DELETE EXAM
// ==========================================

const deleteExam = async (
  req,
  res
) => {
  try {
    const exam =
      await Exam.findByIdAndDelete(
        req.params.id
      );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};