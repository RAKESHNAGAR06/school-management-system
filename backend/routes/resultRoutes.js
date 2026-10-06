const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  addResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
} = require("../controllers/resultController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

router.post("/", addResult);
router.get("/", getResults);
router.get("/:id", validateObjectId("id"), getResultById);
router.put("/:id", validateObjectId("id"), updateResult);
router.delete("/:id", validateObjectId("id"), deleteResult);

module.exports = router;