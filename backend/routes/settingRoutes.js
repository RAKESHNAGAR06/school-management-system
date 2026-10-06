const express = require("express");
const upload = require("../middleware/upload");

const {
  getSchoolSettings,
  createSchoolSettings,
  updateSchoolSettings,
  getAdminProfile,
  updateAdminProfile,
  uploadSchoolLogo,
} = require("../controllers/settingController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC SCHOOL SETTINGS
// ==========================================

// School name/logo can remain public because
// Login page/sidebar may need basic branding.
router.get(
  "/",
  getSchoolSettings
);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

router.post(
  "/",
  protect,
  adminOnly,
  createSchoolSettings
);

router.put(
  "/",
  protect,
  adminOnly,
  updateSchoolSettings
);

router.get(
  "/admin-profile",
  protect,
  adminOnly,
  getAdminProfile
);

router.put(
  "/admin-profile",
  protect,
  adminOnly,
  updateAdminProfile
);

router.post(
  "/logo",
  protect,
  adminOnly,
  upload.single("logo"),
  uploadSchoolLogo
);



module.exports = router;