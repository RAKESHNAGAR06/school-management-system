const express = require("express");

const {
  addClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/classController");
const {
  protect,
  adminOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();
// Get All Classes
router.get(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  getClasses
);

router.use(protect, adminOnly);

// Add Class
router.post("/", addClass);

// Get Single Class
router.get("/:id", getClassById);

// Update Class
router.put("/:id", updateClass);

// Delete Class
router.delete("/:id", deleteClass);

module.exports = router;