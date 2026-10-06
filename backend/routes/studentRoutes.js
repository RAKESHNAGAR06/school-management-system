const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentDashboard,
  getMyAttendance,
  getMyExams,
  getMyResults,
  getMyProfile,
  getArchivedStudents,
  restoreStudent,
} = require("../controllers/studentController");

const {
  protect,
  adminOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/archived",
  protect,
  adminOnly,
  getArchivedStudents
);








router.get(
  "/profile",
  protect,
  authorizeRoles("student"),
  getMyProfile
);


router.get(
  "/results",
  protect,
  authorizeRoles("student"),
  getMyResults
);


router.get(
  "/exams",
  protect,
  authorizeRoles("student"),
  getMyExams
);


router.get(
  "/attendance",
  protect,
  authorizeRoles("student"),
  getMyAttendance
);


router.get(
  "/dashboard",
  protect,
  authorizeRoles("student"),
  getStudentDashboard
);

router.use(protect, adminOnly);

router.post("/", addStudent);
router.get("/", getStudents);

router.patch(
  "/:id/restore",
  protect,
  adminOnly,
  validateObjectId("id"),
  restoreStudent
);

router.put(
  "/:id",
  validateObjectId("id"),
  updateStudent
);
router.delete(
  "/:id",
  validateObjectId("id"),
  deleteStudent
);

module.exports = router;