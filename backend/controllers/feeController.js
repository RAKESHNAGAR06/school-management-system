const Fee = require("../models/Fee");
const Student = require("../models/Student");
const {
  createAutomaticNotification,
  getStudentAndParentUserIds,
} = require("../services/notificationService");

// ==========================================
// HELPERS
// ==========================================

const calculateFeeStatus = (
  amount,
  paidAmount
) => {
  const dueAmount = Math.max(
    amount - paidAmount,
    0
  );

  let status = "pending";

  if (dueAmount === 0) {
    status = "paid";
  } else if (paidAmount > 0) {
    status = "partial";
  }

  return {
    dueAmount,
    status,
  };
};

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ==========================================
// FEE NOTIFICATION
// ==========================================

const sendFeeNotification =
  async (
    fee,
    createdBy,
    isUpdate = false
  ) => {
    const targetUsers =
      await getStudentAndParentUserIds(
        fee.studentId
      );

    if (
      targetUsers.length === 0
    ) {
      console.log(
        "Fee notification skipped: no linked Student/Parent User accounts found"
      );

      return;
    }

    let title;

    if (fee.status === "paid") {
      title = "Fee Payment Completed";
    } else if (
      fee.status === "partial"
    ) {
      title =
        "Fee Payment Updated";
    } else {
      title = isUpdate
        ? "Fee Details Updated"
        : "Fee Due Notification";
    }

    const message = [
      fee.studentName
        ? `Student: ${fee.studentName}`
        : "",

      fee.feeType
        ? `Fee Type: ${fee.feeType}`
        : "",

      `Total Amount: ₹${fee.amount}`,

      `Paid Amount: ₹${fee.paidAmount || 0}`,

      `Due Amount: ₹${fee.dueAmount || 0}`,

      fee.dueDate
        ? `Due Date: ${formatDate(
            fee.dueDate
          )}`
        : "",

      `Status: ${fee.status}`,
    ]
      .filter(Boolean)
      .join("\n");

    await createAutomaticNotification({
      title,

      message,

      type: "fee",

      targetType: "user",

      targetUsers,

      createdBy,

      channels: {
        inApp: true,
        email: true,
        whatsapp: true,
      },
    });
  };

// ==========================================
// ADD FEE
// ==========================================

const addFee = async (
  req,
  res
) => {
  try {
    const {
      studentId,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message:
          "Student is required",
      });
    }

    // ==========================================
    // ACTIVE STUDENT CHECK
    // ==========================================

    const student =
      await Student.findOne({
        _id: studentId,
        isActive: true,
      }).select(
        "_id name email className section"
      );

    if (!student) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot add fee. Student does not exist or is archived.",
      });
    }

    const amount =
      Number(
        req.body.amount || 0
      );

    const paidAmount =
      Number(
        req.body.paidAmount || 0
      );

    if (
      Number.isNaN(amount) ||
      Number.isNaN(paidAmount)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount and paid amount must be valid numbers",
      });
    }

    if (
      amount < 0 ||
      paidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fee amounts cannot be negative",
      });
    }

    if (paidAmount > amount) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total amount",
      });
    }

    const {
      dueAmount,
      status,
    } = calculateFeeStatus(
      amount,
      paidAmount
    );

    const feeData = {
      ...req.body,

      studentId,

      /*
        If your Fee schema stores studentName,
        backend controls its value.
      */
      studentName: student.name,

      amount,
      paidAmount,
      dueAmount,
      status,
    };

    const fee =
      await Fee.create(
        feeData
      );

    await sendFeeNotification(
      fee,
      req.user.userId,
      false
    );

    return res.status(201).json({
      success: true,
      message:
        "Fee added successfully",
      data: fee,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Fee record already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Add fee error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add fee",
    });
  }
};

// ==========================================
// GET ALL FEES
// ==========================================

const getFees = async (
  req,
  res
) => {
  try {
    const fees =
      await Fee.find()
        .populate(
          "studentId",
          "name email className section rollNumber"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET FEE BY ID
// ==========================================

const getFeeById = async (
  req,
  res
) => {
  try {
    const fee =
      await Fee.findById(
        req.params.id
      ).populate(
        "studentId",
        "name email className section rollNumber"
      );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message:
          "Fee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE FEE
// ==========================================

const updateFee = async (
  req,
  res
) => {
  try {
    const fee =
      await Fee.findById(
        req.params.id
      );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message:
          "Fee not found",
      });
    }

    // ==========================================
    // ARCHIVE SAFETY
    // ==========================================

    const student =
      await Student.findOne({
        _id: fee.studentId,
        isActive: true,
      }).select("_id name");

    if (!student) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot update fee because the student is archived or no longer available.",
      });
    }

    /*
      Do not allow an update request to move an
      existing fee to another student.
    */
    const {
      studentId: ignoredStudentId,
      studentName: ignoredStudentName,
      dueAmount: ignoredDueAmount,
      status: ignoredStatus,
      ...safeBody
    } = req.body;

    const updateData = {
      ...safeBody,
    };

    const amount =
      req.body.amount !== undefined
        ? Number(req.body.amount)
        : Number(fee.amount);

    const paidAmount =
      req.body.paidAmount !== undefined
        ? Number(
            req.body.paidAmount
          )
        : Number(
            fee.paidAmount || 0
          );

    if (
      Number.isNaN(amount) ||
      Number.isNaN(paidAmount)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount and paid amount must be valid numbers",
      });
    }

    if (
      amount < 0 ||
      paidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fee amounts cannot be negative",
      });
    }

    if (
      paidAmount > amount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total amount",
      });
    }

    const {
      dueAmount,
      status,
    } = calculateFeeStatus(
      amount,
      paidAmount
    );

    updateData.amount =
      amount;

    updateData.paidAmount =
      paidAmount;

    updateData.dueAmount =
      dueAmount;

    updateData.status =
      status;

    // Keep backend snapshot correct.
    updateData.studentName =
      student.name;

    const updatedFee =
      await Fee.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    await sendFeeNotification(
      updatedFee,
      req.user.userId,
      true
    );

    return res.status(200).json({
      success: true,
      message:
        "Fee updated successfully",
      data: updatedFee,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid fee or student ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Update fee error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update fee",
    });
  }
};

// ==========================================
// DELETE FEE
// ==========================================

const deleteFee = async (
  req,
  res
) => {
  try {
    const fee =
      await Fee.findByIdAndDelete(
        req.params.id
      );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message:
          "Fee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Fee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
};