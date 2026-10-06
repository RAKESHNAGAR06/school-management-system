const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  addExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

// Add Exam
router.post("/", addExam);

// Get All Exams
router.get("/", getExams);

// Get Exam By ID
router.get("/:id", validateObjectId("id"), getExamById);

// Update Exam
router.put("/:id", validateObjectId("id"), updateExam);

// Delete Exam
router.delete("/:id", validateObjectId("id"), deleteExam);

module.exports = router;