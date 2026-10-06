const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  addParent,
  getParents,
  getParentById,
  updateParent,
  deleteParent,
  getParentDashboard,
  getMyChild,
  getMyChildAttendance,
  getMyChildExams,
  getMyChildResults,
  getMyChildFees,
  getMyProfile,
  getArchivedParents,
  restoreParent,
} = require("../controllers/parentController");

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
  getArchivedParents
);






router.get(
  "/profile",
  protect,
  authorizeRoles("parent"),
  getMyProfile
);


router.get(
  "/fees",
  protect,
  authorizeRoles("parent"),
  getMyChildFees
);


router.get(
  "/results",
  protect,
  authorizeRoles("parent"),
  getMyChildResults
);


router.get(
  "/exams",
  protect,
  authorizeRoles("parent"),
  getMyChildExams
);


router.get(
  "/attendance",
  protect,
  authorizeRoles("parent"),
  getMyChildAttendance
);


router.get(
  "/my-child",
  protect,
  authorizeRoles("parent"),
  getMyChild
);


router.get(
  "/dashboard",
  protect,
  authorizeRoles("parent"),
  getParentDashboard
);


router.use(protect, adminOnly);

router.post("/", addParent);
router.get("/", getParents);
router.patch(
  "/:id/restore",
  protect,
  adminOnly,
  validateObjectId("id"),
  restoreParent
);

router.get(
  "/:id",
  validateObjectId("id"),
  getParentById
);
router.put(
  "/:id",
  validateObjectId("id"),
  updateParent
);
router.delete(
  "/:id",
  validateObjectId("id"),
  deleteParent
);

module.exports = router;