const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);
const router = express.Router();

const {
  addHomework,
  getTeacherHomework,
  getStudentHomework,
  getParentHomework,
  deleteHomework,
  updateHomework,
  getAllHomework,
} = require("../controllers/homeworkController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllHomework
);

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher"),
  validateObjectId("id"),
  updateHomework
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  validateObjectId("id"),
  deleteHomework
);

router.get(
  "/parent",
  protect,
  authorizeRoles("parent"),
  getParentHomework
);

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentHomework
);

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getTeacherHomework
);

router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  addHomework
);

module.exports = router;