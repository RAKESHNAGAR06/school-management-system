const express = require("express");

const {
  getReportSummary,
  getAttendanceReport,
  getFeesReport,
  getPerformanceReport,
  exportResultsCSV,
  exportAttendanceCSV,
  exportFeesCSV,
  exportPerformanceCSV,
  getStudentWiseReport,
} = require("../controllers/reportController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

router.get("/summary", getReportSummary);
router.get("/attendance", getAttendanceReport);
router.get("/fees", getFeesReport);
router.get("/performance", getPerformanceReport);
router.get("/results/export", exportResultsCSV);
router.get("/attendance/export", exportAttendanceCSV);
router.get("/fees/export", exportFeesCSV);
router.get("/performance/export", exportPerformanceCSV);
router.get("/students", getStudentWiseReport);

module.exports = router;