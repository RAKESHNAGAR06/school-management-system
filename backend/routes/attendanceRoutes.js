const express = require("express");

const {
  addAttendance,
  addBulkAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

router.post("/", addAttendance);
router.post("/bulk", addBulkAttendance);
router.get("/", getAttendance);
router.get("/:id", getAttendanceById);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

module.exports = router;