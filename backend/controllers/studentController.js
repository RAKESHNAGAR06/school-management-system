const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Result = require("../models/Result");

const Parent = require("../models/Parent");
const mongoose = require("mongoose");
const generateTemporaryPassword = require("../utils/generateTemporaryPassword");
const {
  sendLoginCredentials,
} = require("../services/credentialDeliveryService");


//Add Student
const addStudent = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      name,
      email,
      phone = "",
      gender = "male",
      dateOfBirth,
      className = "",
      section = "",
      rollNumber = "",
      address = "",
      parentId = null,
    } = req.body;

    // ==========================================
    // 1. BASIC VALIDATION
    // ==========================================

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name and email are required",
      });
    }

    const cleanName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanPhone =
      typeof phone === "string"
        ? phone.trim()
        : "";

    // ==========================================
    // 2. START TRANSACTION
    // ==========================================

    session.startTransaction();

    // ==========================================
    // 3. DUPLICATE CHECK
    // ==========================================

    const existingStudent =
      await Student.findOne({
        email: normalizedEmail,
      })
        .session(session)
        .lean();

    if (existingStudent) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Student with this email already exists",
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
    // 4. VALIDATE PARENT
    // ==========================================

    let parent = null;

    const cleanParentId =
      parentId &&
      String(parentId).trim()
        ? String(parentId).trim()
        : null;

    if (cleanParentId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          cleanParentId
        )
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Invalid parent ID",
        });
      }

      parent = await Parent.findOne({
        _id: cleanParentId,
      }).session(session);

      if (!parent) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            "Selected parent not found",
        });
      }

      if (!parent.isActive) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Selected parent is inactive",
        });
      }

      if (parent.studentId) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "Selected parent is already linked to another student",
        });
      }
    }

    // ==========================================
    // 5. CREATE STUDENT
    // ==========================================

    const students =
      await Student.create(
        [
          {
            name: cleanName,
            email: normalizedEmail,
            phone: cleanPhone,
            gender,

            dateOfBirth:
              dateOfBirth ||
              undefined,

            className:
              typeof className ===
              "string"
                ? className.trim()
                : "",

            section:
              typeof section ===
              "string"
                ? section.trim()
                : "",

            rollNumber:
              typeof rollNumber ===
              "string"
                ? rollNumber.trim()
                : "",

            address:
              typeof address ===
              "string"
                ? address.trim()
                : "",

            parentId:
              parent?._id || null,

            parentName:
              parent?.name || "",

            parentPhone:
              parent?.phone || "",

            isActive: true,
          },
        ],
        {
          session,
        }
      );

    const student = students[0];

    // ==========================================
    // 6. CREATE LOGIN USER
    // ==========================================

    const temporaryPassword =
  generateTemporaryPassword();

    await User.create(
      [
        {
          name: cleanName,
          email: normalizedEmail,
          password: temporaryPassword,
          role: "student",
          phone: cleanPhone,
          isActive: true,
		  mustChangePassword: true,
        },
      ],
      {
        session,
      }
    );

    // ==========================================
    // 7. LINK PARENT
    // ==========================================

    if (parent) {
      const parentUpdate =
        await Parent.updateOne(
          {
            _id: parent._id,
            studentId: null,
            isActive: true,
          },
          {
            $set: {
              studentId:
                student._id,
            },
          },
          {
            session,
          }
        );

      if (
        parentUpdate.modifiedCount !== 1
      ) {
        throw new Error(
          "PARENT_LINK_CONFLICT"
        );
      }
    }

    // ==========================================
    // 8. COMMIT
    // ==========================================

    await session.commitTransaction();

// ==========================================
// SEND LOGIN CREDENTIALS
// ==========================================

const credentialDelivery =
  await sendLoginCredentials({
    name: cleanName,
    email: normalizedEmail,
    phone: cleanPhone,
    role: "student",
    temporaryPassword,
  });

const populatedStudent =
  await Student.findById(
    student._id
  ).populate(
    "parentId",
    "name email phone relation"
  );

return res.status(201).json({
  success: true,
  message:
    "Student added successfully",

  data: populatedStudent,

  temporaryPassword,

  credentialDelivery,
});
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Add student error:",
      error
    );

    if (
      error.message ===
      "PARENT_LINK_CONFLICT"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Selected parent is already linked to another student",
      });
    }

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
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to add student",
    });
  } finally {
    await session.endSession();
  }
};


// Update Student
const updateStudent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // ==========================================
    // 1. FIND STUDENT
    // ==========================================

    const student = await Student.findById(
      req.params.id
    ).session(session);

    if (!student) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const oldEmail = String(
      student.email || ""
    )
      .trim()
      .toLowerCase();

    const oldParentId =
      student.parentId?.toString() || null;

    // ==========================================
    // 2. NORMALIZE PARENT ID
    // ==========================================

    let newParentId = null;

    if (
      req.body.parentId !== undefined &&
      req.body.parentId !== null &&
      String(req.body.parentId).trim()
    ) {
      newParentId = String(
        req.body.parentId
      ).trim();
    }

    let selectedParent = null;

    // ==========================================
    // 3. VALIDATE SELECTED PARENT
    // ==========================================

    if (newParentId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          newParentId
        )
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Invalid parent ID",
        });
      }

      selectedParent =
        await Parent.findById(
          newParentId
        ).session(session);

      if (!selectedParent) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            "Selected parent not found",
        });
      }

      if (!selectedParent.isActive) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Selected parent is inactive",
        });
      }

      if (
        selectedParent.studentId &&
        selectedParent.studentId.toString() !==
          student._id.toString()
      ) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "Selected parent is already linked to another student",
        });
      }
    }

    // ==========================================
    // 4. SAFE UPDATE DATA
    // ==========================================

    const allowedFields = [
	  "name",
	  "email",
	  "phone",
	  "gender",
	  "dateOfBirth",
	  "className",
	  "section",
	  "rollNumber",
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
    // 5. VALIDATE NAME
    // ==========================================

    if (updateData.name !== undefined) {
      if (
        typeof updateData.name !==
        "string"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Student name must be text",
        });
      }

      updateData.name =
        updateData.name.trim();

      if (!updateData.name) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Student name is required",
        });
      }
    }

    // ==========================================
    // 6. VALIDATE EMAIL
    // ==========================================

    if (updateData.email !== undefined) {
      if (
        typeof updateData.email !==
        "string"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Student email must be text",
        });
      }

      updateData.email =
        updateData.email
          .trim()
          .toLowerCase();

      if (!updateData.email) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Student email is required",
        });
      }
    }

    // ==========================================
    // 7. NORMALIZE STRING FIELDS
    // ==========================================

    const simpleStringFields = [
      "phone",
      "className",
      "section",
      "rollNumber",
      "address",
    ];

    for (const field of simpleStringFields) {
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
    // 8. VALIDATE GENDER
    // ==========================================

    if (updateData.gender !== undefined) {
      if (
        typeof updateData.gender !==
        "string"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Gender must be text",
        });
      }

      updateData.gender =
        updateData.gender
          .trim()
          .toLowerCase();

      const allowedGenders = [
        "male",
        "female",
        "other",
      ];

      if (
        !allowedGenders.includes(
          updateData.gender
        )
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Invalid gender",
        });
      }
    }

   

    // ==========================================
    // 10. EMAIL + USER
    // ==========================================

    const newEmail =
      updateData.email !== undefined
        ? updateData.email
        : oldEmail;

    const linkedUser = oldEmail
      ? await User.findOne({
          email: oldEmail,
          role: "student",
        }).session(session)
      : null;

    if (
      newEmail &&
      newEmail !== oldEmail
    ) {
      const existingStudent =
        await Student.findOne({
          email: newEmail,
          _id: {
            $ne: student._id,
          },
        })
          .session(session)
          .select("_id")
          .lean();

      if (existingStudent) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "Another student already uses this email",
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
    // 11. APPLY STUDENT CHANGES
    // ==========================================

    Object.entries(updateData).forEach(
      ([field, value]) => {
        student[field] = value;
      }
    );

    student.parentId =
      selectedParent?._id || null;

    student.parentName =
      selectedParent?.name || "";

    student.parentPhone =
      selectedParent?.phone || "";

    await student.save({
      session,
    });

    // ==========================================
    // 12. UNLINK OLD PARENT
    // ==========================================

    if (
      oldParentId &&
      oldParentId !== newParentId
    ) {
      await Parent.updateOne(
        {
          _id: oldParentId,
          studentId: student._id,
        },
        {
          $set: {
            studentId: null,
          },
        },
        {
          session,
        }
      );
    }

    // ==========================================
    // 13. LINK NEW PARENT
    // ==========================================

    if (selectedParent) {
      const parentLinkResult =
        await Parent.updateOne(
          {
            _id: selectedParent._id,

            $or: [
              {
                studentId: null,
              },
              {
                studentId:
                  student._id,
              },
            ],

            isActive: true,
          },
          {
            $set: {
              studentId:
                student._id,
            },
          },
          {
            session,
          }
        );

      /*
        modifiedCount can be 0 when the same
        student-parent relationship already
        exists, so matchedCount is what matters.
      */

      if (
        parentLinkResult.matchedCount !== 1
      ) {
        throw new Error(
          "PARENT_LINK_CONFLICT"
        );
      }
    }

    // ==========================================
    // 14. SYNC LOGIN USER
    // ==========================================

    if (linkedUser) {
      linkedUser.name =
        student.name;

      linkedUser.email =
        student.email;

      linkedUser.phone =
        student.phone || "";

      linkedUser.isActive =
        student.isActive;

      await linkedUser.save({
        session,
      });
    }

    // ==========================================
    // 15. COMMIT
    // ==========================================

    await session.commitTransaction();

    const updatedStudent =
      await Student.findById(
        student._id
      )
        .populate(
          "parentId",
          "name email phone relation"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Update student error:",
      error
    );

    if (
      error.message ===
      "PARENT_LINK_CONFLICT"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Selected parent is already linked to another student",
      });
    }

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
          "Invalid student or parent ID",
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
        "Unable to update student",
    });
  } finally {
    await session.endSession();
  }
};


// Delete Student
const deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const student =
      await Student.findById(
        req.params.id
      ).session(session);

    if (!student) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.isActive === false) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Student is already archived",
      });
    }

    const studentEmail = String(
      student.email || ""
    )
      .trim()
      .toLowerCase();

    // ==========================================
    // 1. UNLINK PARENT
    // ==========================================

    if (student.parentId) {
      await Parent.updateOne(
        {
          _id: student.parentId,
          studentId: student._id,
        },
        {
          $set: {
            studentId: null,
          },
        },
        {
          session,
        }
      );
    }

    // ==========================================
    // 2. ARCHIVE STUDENT
    // ==========================================

    student.isActive = false;

    /*
      Parent snapshots are cleared because
      archived student no longer owns the
      active parent relationship.
    */

    student.parentId = null;
    student.parentName = "";
    student.parentPhone = "";

    await student.save({
      session,
    });

    // ==========================================
    // 3. DISABLE LOGIN
    // ==========================================

    if (studentEmail) {
      await User.updateOne(
        {
          email: studentEmail,
          role: "student",
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
        "Student archived successfully",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Archive student error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive student",
    });
  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET ARCHIVED STUDENTS
// ==========================================

const getArchivedStudents = async (req, res) => {
  try {
    const students = await Student.find({
      isActive: false,
    })
      .populate(
        "parentId",
        "name email phone relation"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(
      "Get archived students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch archived students",
    });
  }
};


// ==========================================
// RESTORE STUDENT
// ==========================================

const restoreStudent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const student = await Student.findById(
      req.params.id
    ).session(session);

    if (!student) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.isActive === true) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Student is already active",
      });
    }

    const studentEmail = String(
      student.email || ""
    )
      .trim()
      .toLowerCase();

    if (!studentEmail) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Student email is required for restore",
      });
    }

    // ==========================================
    // FIND EXISTING LOGIN ACCOUNT
    // ==========================================

    let linkedUser = await User.findOne({
      email: studentEmail,
      role: "student",
    }).session(session);

    let loginAccountCreated = false;
    let temporaryPassword = null;

    // ==========================================
    // CHECK EMAIL USED BY ANOTHER ROLE
    // ==========================================

    if (!linkedUser) {
      const emailUsedByAnotherUser =
        await User.findOne({
          email: studentEmail,
        }).session(session);

      if (emailUsedByAnotherUser) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "This email is already used by another login account",
        });
      }

      // ==========================================
      // CREATE MISSING STUDENT LOGIN
      // ==========================================

      temporaryPassword =
  generateTemporaryPassword();

      const createdUsers = await User.create(
        [
          {
            name: student.name,
            email: studentEmail,
            password: temporaryPassword,
            role: "student",
            phone: student.phone || "",
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

      linkedUser.name = student.name;
      linkedUser.email = studentEmail;
      linkedUser.phone =
        student.phone || "";
      linkedUser.isActive = true;

      await linkedUser.save({
        session,
      });
    }

    // ==========================================
    // RESTORE STUDENT PROFILE
    // ==========================================

    student.isActive = true;

    await student.save({
      session,
    });

    await session.commitTransaction();

    const restoredStudent =
      await Student.findById(student._id)
        .populate(
          "parentId",
          "name email phone relation"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message: loginAccountCreated
        ? "Student restored and login account created successfully"
        : "Student restored successfully",
      data: restoredStudent,

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
      "Restore student error:",
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
      message: "Unable to restore student",
    });
  } finally {
    await session.endSession();
  }
};



// Get All Students
const getStudents = async (
  req,
  res
) => {
  try {
    const students =
      await Student.find({
        isActive: true,
      })
        .populate(
          "parentId",
          "name email phone relation"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(
      "Get students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch students",
    });
  }
};


const getStudentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const student = await Student.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
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

    const upcomingExams = await Exam.find({
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
        studentName: student.name,
        className: student.className,
        section: student.section,
        attendancePercentage,
        upcomingExams: upcomingExams.length,
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


const getMyAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const student = await Student.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const attendance = await Attendance.find({
      studentId: student._id,
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


const getMyExams = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const student = await Student.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
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

const getMyResults = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const student = await Student.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const results = await Result.find({
      studentId: student._id,
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

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const student = await Student.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        role: user.role,
        isActive: user.isActive,
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
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentDashboard,
  getMyAttendance,
  getMyExams,
  getMyResults,
  getMyProfile,
  getArchivedStudents,
  restoreStudent,
};