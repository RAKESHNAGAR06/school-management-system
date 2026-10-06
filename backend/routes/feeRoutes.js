const express = require("express");
const validateObjectId = require(
  "../middleware/validateObjectId"
);

const {
  addFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);

router.post("/", addFee);
router.get("/", getFees);
router.get("/:id", validateObjectId("id"), getFeeById);
router.put("/:id", validateObjectId("id"), updateFee);
router.delete("/:id", validateObjectId("id"), deleteFee);

module.exports = router;