const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);
const {
  protect,
  adminOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  addTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherDashboard,
  getMyClasses,
  getMyStudents,
  getMyAttendanceStudents,
  saveMyAttendance,
  getMyAttendanceByDate,
  getMyExams,
  getMyResults,
  getMyProfile,
  addMyResult,
  updateMyResult,
  deleteMyResult,
  updateMyProfile,
  getArchivedTeachers,
  restoreTeacher,
} = require("../controllers/teacherController");

const router = express.Router();
router.get(
  "/archived",
  protect,
  adminOnly,
  getArchivedTeachers
);






router.put(
  "/profile",
  protect,
  authorizeRoles("teacher"),
  updateMyProfile
);


router.delete(
  "/results/:id",
  protect,
  authorizeRoles("teacher"),
  deleteMyResult
);
router.patch(
  "/:id/restore",
  protect,
  adminOnly,
  validateObjectId("id"),
  restoreTeacher
);

router.put(
  "/results/:id",
  protect,
  authorizeRoles("teacher"),
  updateMyResult
);


router.post(
  "/results",
  protect,
  authorizeRoles("teacher"),
  addMyResult
);


router.get(
  "/profile",
  protect,
  authorizeRoles("teacher"),
  getMyProfile
);


router.get(
  "/my-results",
  protect,
  authorizeRoles("teacher"),
  getMyResults
);

router.get(
  "/my-exams",
  protect,
  authorizeRoles("teacher"),
  getMyExams
);


router.get(
  "/attendance",
  protect,
  authorizeRoles("teacher"),
  getMyAttendanceByDate
);


router.post(
  "/attendance",
  protect,
  authorizeRoles("teacher"),
  saveMyAttendance
);


router.get(
  "/attendance/students",
  protect,
  authorizeRoles("teacher"),
  getMyAttendanceStudents
);

router.get(
  "/my-students",
  protect,
  authorizeRoles("teacher"),
  getMyStudents
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("teacher"),
  getTeacherDashboard
);
router.get(
  "/my-classes",
  protect,
  authorizeRoles("teacher"),
  getMyClasses
);

router.use(protect, adminOnly);

// Add Teacher
router.post("/", addTeacher);

// Get All Teachers
router.get("/", getTeachers);

// Update Teacher
router.put(
  "/:id",
  validateObjectId("id"),
  updateTeacher
);

// Delete Teacher
router.delete(
  "/:id",
  validateObjectId("id"),
  deleteTeacher
);

module.exports = router;