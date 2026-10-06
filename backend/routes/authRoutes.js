const express = require("express");
const {
  loginRateLimiter,
} = require("../middleware/authRateLimiter");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  changePassword,
  resetUserPassword,
  logoutAllDevices,
} = require("../controllers/authController");

const router = express.Router();

//router.post("/register", registerUser);

router.post(
  "/login",
  loginRateLimiter,
  loginUser
);


router.put(
  "/change-password",
  protect,
  changePassword
);

router.patch(
  "/reset-password",
  protect,
  adminOnly,
  resetUserPassword
);

router.post(
  "/logout-all",
  protect,
  logoutAllDevices
);

module.exports = router;