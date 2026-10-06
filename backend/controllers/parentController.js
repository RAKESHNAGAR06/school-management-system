
const mongoose = require("mongoose");
const User = require("../models/User");
const Parent = require("../models/Parent");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Fee = require("../models/Fee");
const Student = require("../models/Student");
const generateTemporaryPassword = require("../utils/generateTemporaryPassword");
const {
  sendLoginCredentials,
} = require("../services/credentialDeliveryService");

// Add Parent
const addParent = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      name,
      email,
      phone,
      relation = "",
      occupation = "",
      address = "",
      isActive = true,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and phone are required",
      });
    }

    if (
      typeof isActive !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    const cleanName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanPhone =
      phone.trim();

    session.startTransaction();

    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    const existingParent =
      await Parent.findOne({
        email: normalizedEmail,
      })
        .session(session)
        .lean();

    if (existingParent) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Parent with this email already exists",
      });
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      })
        .session(session)
        .lean();

    if (existingUser) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "User account with this email already exists",
      });
    }

    // ==========================================
    // CREATE PARENT
    // ==========================================

    const parents =
      await Parent.create(
        [
          {
            name: cleanName,
            email:
              normalizedEmail,
            phone: cleanPhone,

            relation:
              typeof relation ===
              "string"
                ? relation.trim()
                : "",

            occupation:
              typeof occupation ===
              "string"
                ? occupation.trim()
                : "",

            address:
              typeof address ===
              "string"
                ? address.trim()
                : "",

            studentId: null,
            isActive,
          },
        ],
        {
          session,
        }
      );

    const parent = parents[0];

    // ==========================================
    // CREATE USER
    // ==========================================

    const temporaryPassword =
  generateTemporaryPassword();

    await User.create(
      [
        {
          name: cleanName,
          email:
            normalizedEmail,
          password:
            temporaryPassword,
          role: "parent",
          phone: cleanPhone,
          isActive,
		  mustChangePassword: true,
        },
      ],
      {
        session,
      }
    );

    await session.commitTransaction();

	// ==========================================
	// SEND LOGIN CREDENTIALS
	// ==========================================

	const credentialDelivery =
	  await sendLoginCredentials({
		name: cleanName,
		email: normalizedEmail,
		phone: cleanPhone,
		role: "parent",
		temporaryPassword,
	  });

	return res.status(201).json({
	  success: true,

	  message:
		"Parent added successfully. You can now assign this parent while adding or editing a student.",

	  data: parent,

	  temporaryPassword,

	  credentialDelivery,
	});
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Add parent error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email already exists",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to add parent",
    });
  } finally {
    await session.endSession();
  }
};

// Get All Parents
const getParents = async (
  req,
  res
) => {
  try {
    const parents =
      await Parent.find({
        isActive: true,
      })
        .populate(
          "studentId",
          "name email className section rollNumber"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: parents.length,
      data: parents,
    });
  } catch (error) {
    console.error(
      "Get parents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch parents",
    });
  }
};


// Get Single Parent
const getParentById = async (
  req,
  res
) => {
  try {
    const parent =
      await Parent.findOne({
        _id: req.params.id,
        isActive: true,
      }).populate(
        "studentId",
        "name email className section rollNumber"
      );

    if (!parent) {
      return res.status(404).json({
        success: false,
        message:
          "Active parent not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid parent ID",
      });
    }

    console.error(
      "Get parent error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch parent",
    });
  }
};

//Update Parent
const updateParent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const parent =
      await Parent.findById(
        req.params.id
      ).session(session);

    if (!parent) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const oldEmail = String(
      parent.email || ""
    )
      .trim()
      .toLowerCase();

    const allowedFields = [
	  "name",
	  "email",
	  "phone",
	  "relation",
	  "occupation",
	  "address",
	];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          req.body[field];
      }
    });

    // ==========================================
    // VALIDATE REQUIRED STRINGS
    // ==========================================

    const requiredStrings = [
      "name",
      "email",
      "phone",
    ];

    for (const field of requiredStrings) {
      if (
        updateData[field] !== undefined
      ) {
        if (
          typeof updateData[field] !==
            "string" ||
          !updateData[field].trim()
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,
            message:
              `${field} is required`,
          });
        }

        updateData[field] =
          updateData[field].trim();
      }
    }

    if (updateData.email) {
      updateData.email =
        updateData.email.toLowerCase();
    }

    const optionalStrings = [
      "relation",
      "occupation",
      "address",
    ];

    for (const field of optionalStrings) {
      if (
        updateData[field] !== undefined
      ) {
        if (
          typeof updateData[field] !==
          "string"
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,
            message:
              `${field} must be text`,
          });
        }

        updateData[field] =
          updateData[field].trim();
      }
    }

   

    // ==========================================
    // LOGIN USER + EMAIL CHECK
    // ==========================================

    const linkedUser =
      await User.findOne({
        email: oldEmail,
        role: "parent",
      }).session(session);

    const newEmail =
      updateData.email !== undefined
        ? updateData.email
        : oldEmail;

    if (
      newEmail &&
      newEmail !== oldEmail
    ) {
      const existingParent =
        await Parent.findOne({
          email: newEmail,
          _id: {
            $ne: parent._id,
          },
        })
          .session(session)
          .select("_id")
          .lean();

      if (existingParent) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "Another parent already uses this email",
        });
      }

      const existingUser =
        await User.findOne({
          email: newEmail,
        })
          .session(session)
          .select("_id")
          .lean();

      if (
        existingUser &&
        (!linkedUser ||
          existingUser._id.toString() !==
            linkedUser._id.toString())
      ) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "This email is already used by another account",
        });
      }
    }

    // ==========================================
    // UPDATE PARENT
    // ==========================================

    Object.entries(updateData).forEach(
      ([field, value]) => {
        parent[field] = value;
      }
    );

    await parent.save({
      session,
    });

    // ==========================================
    // SYNC STUDENT SNAPSHOT
    // ==========================================

    if (parent.studentId) {
      const linkedStudent =
        await Student.findOne({
          _id: parent.studentId,
          parentId: parent._id,
        }).session(session);

      if (linkedStudent) {
        linkedStudent.parentName =
          parent.name;

        linkedStudent.parentPhone =
          parent.phone;

        await linkedStudent.save({
          session,
        });
      } else {
        parent.studentId = null;

        await parent.save({
          session,
        });
      }
    }

    // ==========================================
    // SYNC LOGIN USER
    // ==========================================

    if (linkedUser) {
      linkedUser.name = parent.name;
      linkedUser.email = parent.email;
      linkedUser.phone =
        parent.phone || "";

      linkedUser.isActive =
        parent.isActive;

      await linkedUser.save({
        session,
      });
    }

    await session.commitTransaction();

    const updatedParent =
      await Parent.findById(
        parent._id
      ).populate(
        "studentId",
        "name email className section rollNumber"
      );

    return res.status(200).json({
      success: true,
      message:
        "Parent updated successfully",
      data: updatedParent,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Update parent error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email already exists",
      });
    }

    if (error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid parent ID",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update parent",
    });
  } finally {
    await session.endSession();
  }
};

// Delete Parent
const deleteParent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const parent =
      await Parent.findById(
        req.params.id
      ).session(session);

    if (!parent) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    if (parent.isActive === false) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Parent is already archived",
      });
    }

    const parentEmail = String(
      parent.email || ""
    )
      .trim()
      .toLowerCase();

    // ==========================================
    // 1. UNLINK STUDENT
    // ==========================================

    if (parent.studentId) {
      await Student.updateOne(
        {
          _id: parent.studentId,
          parentId: parent._id,
        },
        {
          $set: {
            parentId: null,
            parentName: "",
            parentPhone: "",
          },
        },
        {
          session,
        }
      );
    }

    // ==========================================
    // 2. ARCHIVE PARENT
    // ==========================================

    parent.studentId = null;
    parent.isActive = false;

    await parent.save({
      session,
    });

    // ==========================================
    // 3. DISABLE LOGIN
    // ==========================================

    if (parentEmail) {
      await User.updateOne(
        {
          email: parentEmail,
          role: "parent",
        },
        {
           $set: {
		  isActive: false,
		},

		$inc: {
		  tokenVersion: 1,
		},
	  },
        {
          session,
        }
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Parent archived successfully",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Archive parent error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive parent",
    });
  } finally {
    await session.endSession();
  }
};




// ==========================================
// GET ARCHIVED PARENTS
// ==========================================

const getArchivedParents = async (req, res) => {
  try {
    const parents = await Parent.find({
      isActive: false,
    })
      .populate(
        "studentId",
        "name email className section rollNumber"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: parents.length,
      data: parents,
    });
  } catch (error) {
    console.error(
      "Get archived parents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch archived parents",
    });
  }
};


// ==========================================
// RESTORE PARENT
// ==========================================

const restoreParent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const parent = await Parent.findById(
      req.params.id
    ).session(session);

    if (!parent) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    if (parent.isActive === true) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Parent is already active",
      });
    }

    const parentEmail = String(
      parent.email || ""
    )
      .trim()
      .toLowerCase();

    if (!parentEmail) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Parent email is required for restore",
      });
    }

    // ==========================================
    // FIND EXISTING LOGIN ACCOUNT
    // ==========================================

    let linkedUser = await User.findOne({
      email: parentEmail,
      role: "parent",
    }).session(session);

    let loginAccountCreated = false;
    let temporaryPassword = null;

    // ==========================================
    // CREATE LOGIN IF MISSING
    // ==========================================

    if (!linkedUser) {
      const emailUsedByAnotherUser =
        await User.findOne({
          email: parentEmail,
        }).session(session);

      if (emailUsedByAnotherUser) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "This email is already used by another login account",
        });
      }

      temporaryPassword =
  generateTemporaryPassword();

      const createdUsers = await User.create(
        [
          {
            name: parent.name,
            email: parentEmail,
            password: temporaryPassword,
            role: "parent",
            phone: parent.phone || "",
            isActive: true,
			mustChangePassword: true,
          },
        ],
        {
          session,
        }
      );

      linkedUser = createdUsers[0];
      loginAccountCreated = true;
    } else {
      // ==========================================
      // REACTIVATE EXISTING LOGIN
      // ==========================================

      linkedUser.name = parent.name;
      linkedUser.email = parentEmail;
      linkedUser.phone =
        parent.phone || "";
      linkedUser.isActive = true;

      await linkedUser.save({
        session,
      });
    }

    // ==========================================
    // RESTORE PARENT PROFILE
    // ==========================================

    parent.isActive = true;

    await parent.save({
      session,
    });

    await session.commitTransaction();

    const restoredParent =
      await Parent.findById(parent._id)
        .populate(
          "studentId",
          "name email className section rollNumber"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message: loginAccountCreated
        ? "Parent restored and login account created successfully"
        : "Parent restored successfully",
      data: restoredParent,

      ...(loginAccountCreated && {
        loginAccountCreated: true,
        temporaryPassword,
      }),
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Restore parent error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email already belongs to another account",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to restore parent",
    });
  } finally {
    await session.endSession();
  }
};


const getParentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
}).populate({
  path: "studentId",
  match: {
    isActive: true,
  },
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const student = parent.studentId;

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Linked student not found",
      });
    }

    const attendanceRecords = await Attendance.find({
      studentId: student._id,
    });

    const totalAttendance = attendanceRecords.length;

    const presentCount = attendanceRecords.filter(
      (record) =>
        record.status === "present" || record.status === "late"
    ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    const upcomingExams = await Exam.countDocuments({
      className: student.className,
      section: student.section,
      examDate: { $gte: new Date() },
      isActive: true,
    });

    const resultsCount = await Result.countDocuments({
      studentId: student._id,
    });

    res.json({
      success: true,
      data: {
        parentName: parent.name,
        studentName: student.name,
        className: student.className,
        section: student.section,
        attendancePercentage,
        upcomingExams,
        resultsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyChild = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
}).populate({
  path: "studentId",
  match: {
    isActive: true,
  },
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    if (!parent.studentId) {
      return res.status(404).json({
        success: false,
        message: "Linked student not found",
      });
    }

    res.json({
      success: true,
      data: parent.studentId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyChildAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const attendance = await Attendance.find({
      studentId: parent.studentId,
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyChildExams = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
}).populate({
  path: "studentId",
  match: {
    isActive: true,
  },
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const student = parent.studentId;

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Linked student not found",
      });
    }

    const exams = await Exam.find({
      className: student.className,
      section: student.section,
      isActive: true,
    }).sort({ examDate: 1 });

    res.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyChildResults = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const results = await Result.find({
      studentId: parent.studentId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyChildFees = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    if (!parent.studentId) {
      return res.status(404).json({
        success: false,
        message: "Linked student not found",
      });
    }

    const fees = await Fee.find({
      studentId: parent.studentId,
    }).sort({ dueDate: -1 });

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const parent = await Parent.findOne({
  email: user.email,
  isActive: true,
}).populate({
  path: "studentId",
  match: {
    isActive: true,
  },
});

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        relation: parent.relation,
        occupation: parent.occupation,
        address: parent.address,
        isActive: parent.isActive,
        role: user.role,
        childName: parent.studentId?.name || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
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
};