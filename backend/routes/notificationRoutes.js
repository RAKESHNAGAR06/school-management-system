const express = require("express");

const {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllNotifications,
  deleteNotification,
  sendTestEmail,
  retryFailedEmail,
  getFailedEmailDeliveries,
  sendTestWhatsApp,
  getFailedWhatsAppDeliveries,
  retryFailedWhatsApp,
} = require("../controllers/notificationController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/failed-whatsapp",
  protect,
  authorizeRoles("admin"),
  getFailedWhatsAppDeliveries
);

router.post(
  "/failed-whatsapp/:id/retry",
  protect,
  authorizeRoles("admin"),
  retryFailedWhatsApp
);

router.post(
  "/test-whatsapp",
  protect,
  authorizeRoles("admin"),
  sendTestWhatsApp
);

router.get(
  "/failed-emails",
  protect,
  authorizeRoles("admin"),
  getFailedEmailDeliveries
);

router.post(
  "/failed-emails/:id/retry",
  protect,
  authorizeRoles("admin"),
  retryFailedEmail
);

router.post(
  "/test-email",
  protect,
  authorizeRoles("admin"),
  sendTestEmail
);

// Logged-in user's notifications
router.get(
  "/my",
  protect,
  getMyNotifications
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// Create
router.post(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  createNotification
);

// Admin management
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllNotifications
);

// Admin / Teacher delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  deleteNotification
);

module.exports = router;