const express = require("express");
const router = express.Router();

const {
  addTimetable,
  getTimetables,
  deleteTimetable,
  updateTimetable,
  getTeacherTimetable,
  getStudentTimetable,
  getParentTimetable,
} = require("../controllers/timetableController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/parent",
  protect,
  authorizeRoles("parent"),
  getParentTimetable
);

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentTimetable
);


router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getTeacherTimetable
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateTimetable
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteTimetable
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  addTimetable
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getTimetables
);

module.exports = router;