const express = require("express");

const {
  addEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const {
  protect,
  adminOnly,
} = require(
  "../middleware/authMiddleware"
);

const router = express.Router();


// All authenticated users can view
router.get(
  "/",
  protect,
  adminOnly,
  getEvents
);

router.get(
  "/my-events",
  protect,
  getMyEvents
);

router.get(
  "/:id",
  protect,
  adminOnly,
  getEventById
);

// Admin management
router.post(
  "/",
  protect,
  adminOnly,
  addEvent
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateEvent
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteEvent
);

module.exports = router;