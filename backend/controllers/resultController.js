const Result = require("../models/Result");
const Student = require("../models/Student");
const {
  createAutomaticNotification,
  getStudentAndParentUserIds,
} = require("../services/notificationService");

// ==========================================
// GRADE HELPER
// ==========================================

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";

  return "F";
};

// ==========================================
// RESULT NOTIFICATION
// ==========================================

const sendResultNotification = async (
  result,
  createdBy,
  isUpdate = false
) => {
  const targetUsers =
    await getStudentAndParentUserIds(
      result.studentId
    );

  if (targetUsers.length === 0) {
    console.log(
      "Result notification skipped: no linked Student/Parent User accounts found"
    );

    return;
  }

  const message = [
    `Student: ${result.studentName}`,
    `Exam: ${result.examName}`,
    `Subject: ${result.subjectName}`,
    `Marks: ${result.obtainedMarks}/${result.totalMarks}`,
    `Percentage: ${result.percentage}%`,
    `Grade: ${result.grade}`,
    result.remarks
      ? `Remarks: ${result.remarks}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await createAutomaticNotification({
    title: isUpdate
      ? "Result Updated"
      : "Result Published",

    message,

    type: "result",

    targetType: "user",

    targetUsers,

    createdBy,

    channels: {
      inApp: true,
      email: true,
      whatsapp: true,
    },
  });
};

// ==========================================
// ADD RESULT
// ==========================================

const addResult = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      examId,
      examName,
      subjectName,
      totalMarks,
      obtainedMarks,
      remarks,
    } = req.body;

    if (
      !studentId ||
      !examId ||
      !examName ||
      !subjectName ||
      totalMarks === undefined ||
      obtainedMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields are required",
      });
    }

    // ==========================================
    // ACTIVE STUDENT CHECK
    // ==========================================

    const student = await Student.findOne({
      _id: studentId,
      isActive: true,
    }).select(
      "_id name email className section"
    );

    if (!student) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot add result. Student does not exist or is archived.",
      });
    }

    const marks =
      Number(obtainedMarks);

    const total =
      Number(totalMarks);

    if (
      Number.isNaN(marks) ||
      Number.isNaN(total)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Marks must be valid numbers",
      });
    }

    if (total <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Total marks must be greater than 0",
      });
    }

    if (marks < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be negative",
      });
    }

    if (marks > total) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be greater than total marks",
      });
    }

    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    const existingResult =
      await Result.findOne({
        studentId,
        examId,
      });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message:
          "Result already exists for this student and exam",
      });
    }

    const percentage =
      (marks / total) * 100;

    const grade =
      calculateGrade(percentage);

    // ==========================================
    // CREATE RESULT
    // ==========================================

    const result =
      await Result.create({
        studentId,

        // Don't trust frontend snapshot name.
        studentName: student.name,

        examId,
        examName,
        subjectName,

        totalMarks: total,
        obtainedMarks: marks,

        percentage: Number(
          percentage.toFixed(2)
        ),

        grade,

        remarks:
          typeof remarks === "string"
            ? remarks.trim()
            : "",
      });

    await sendResultNotification(
      result,
      req.user.userId,
      false
    );

    return res.status(201).json({
      success: true,
      message:
        "Result added successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student or exam ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Result already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Add result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add result",
    });
  }
};

// ==========================================
// GET ALL RESULTS
// ==========================================

const getResults = async (req, res) => {
  try {
    const results =
      await Result.find()
        .populate(
          "studentId",
          "name email className section"
        )
        .populate(
          "examId",
          "examName examType examDate"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET RESULT BY ID
// ==========================================

const getResultById = async (
  req,
  res
) => {
  try {
    const result =
      await Result.findById(
        req.params.id
      )
        .populate(
          "studentId",
          "name email className section"
        )
        .populate(
          "examId",
          "examName examType examDate"
        );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE RESULT
// ==========================================

const updateResult = async (
  req,
  res
) => {
  try {
    const {
      obtainedMarks,
      remarks,
    } = req.body;

    const result =
      await Result.findById(
        req.params.id
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Result not found",
      });
    }

    // ==========================================
    // ARCHIVE SAFETY
    // ==========================================

    const student =
      await Student.findOne({
        _id: result.studentId,
        isActive: true,
      }).select("_id name");

    if (!student) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot update result because the student is archived or no longer available.",
      });
    }

    if (
      obtainedMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks are required",
      });
    }

    const marks =
      Number(obtainedMarks);

    if (Number.isNaN(marks)) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks must be a valid number",
      });
    }

    if (marks < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be negative",
      });
    }

    if (
      marks >
      result.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be greater than total marks",
      });
    }

    const percentage =
      result.totalMarks > 0
        ? (marks /
            result.totalMarks) *
          100
        : 0;

    result.obtainedMarks =
      marks;

    result.percentage =
      Number(
        percentage.toFixed(2)
      );

    result.grade =
      calculateGrade(
        percentage
      );

    if (remarks !== undefined) {
      result.remarks =
        typeof remarks === "string"
          ? remarks.trim()
          : "";
    }

    await result.save();

    await sendResultNotification(
      result,
      req.user.userId,
      true
    );

    return res.status(200).json({
      success: true,
      message:
        "Result updated successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid result or student ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Update result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update result",
    });
  }
};

// ==========================================
// DELETE RESULT
// ==========================================

const deleteResult = async (
  req,
  res
) => {
  try {
    const result =
      await Result.findById(
        req.params.id
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Result not found",
      });
    }

    await Result.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Result deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
};