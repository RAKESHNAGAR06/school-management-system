const express = require("express");

const {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const {
  protect,
  adminOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();
// Get All Subjects
router.get(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  getSubjects
);

router.use(protect, adminOnly);

// Add Subject
router.post("/", addSubject);

// Get Single Subject
router.get("/:id", getSubjectById);

// Update Subject
router.put("/:id", updateSubject);

// Delete Subject
router.delete("/:id", deleteSubject);

module.exports = router;