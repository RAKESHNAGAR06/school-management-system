const express = require("express");
const router = express.Router();

const {
  generateStudentPerformanceInsight,
  generateHomework,
  generateExamQuestions,
  generateAttendanceInsight,
  generateNotificationDraft,
  generateReportSummary,
  askSchoolAssistant,
} = require("../controllers/aiController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const aiRateLimiter =
  require("../middleware/aiRateLimiter");

router.use(protect);
router.use(aiRateLimiter);

router.post(
  "/student-performance/:studentId",
  authorizeRoles("admin", "teacher"),
  generateStudentPerformanceInsight
);

router.post(
  "/generate-homework",
  authorizeRoles("teacher"),
  generateHomework
);

router.post(
  "/generate-exam-questions",
  authorizeRoles("teacher"),
  generateExamQuestions
);

router.post(
  "/attendance-insight",
  authorizeRoles("admin", "teacher"),
  generateAttendanceInsight
);

router.post(
  "/notification-draft",
  authorizeRoles("admin"),
  generateNotificationDraft
);

router.post(
  "/report-summary",
  authorizeRoles("admin"),
  generateReportSummary
);

router.post(
  "/assistant",
  authorizeRoles(
    "admin",
    "teacher",
    "student",
    "parent"
  ),
  askSchoolAssistant
);

module.exports = router;