const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");

const User = require("../models/User");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const generateTemporaryPassword =
  require("../utils/generateTemporaryPassword");
const {
  sendLoginCredentials,
} = require("../services/credentialDeliveryService");  
  
const {
  createAutomaticNotification,
  getStudentAndParentUserIds,
} = require("../services/notificationService");


const shouldSendAttendanceAlert = (status) => {
  return ["absent", "late"].includes(
    String(status || "").toLowerCase()
  );
};

const formatAttendanceDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const sendTeacherAttendanceNotification = async (
  attendance,
  createdBy
) => {
  const status = String(
    attendance.status || ""
  ).toLowerCase();

  if (!shouldSendAttendanceAlert(status)) {
    return;
  }

  const targetUsers =
    await getStudentAndParentUserIds(
      attendance.studentId
    );

  if (targetUsers.length === 0) {
    console.log(
      `Attendance notification skipped for ${attendance.studentName}: no linked users found`
    );
    return;
  }

  const message = [
    `Student: ${attendance.studentName}`,
    `Date: ${formatAttendanceDate(attendance.date)}`,
    `Status: ${status === "absent" ? "Absent" : "Late"}`,
    attendance.className
      ? `Class: ${attendance.className}`
      : "",
    attendance.section
      ? `Section: ${attendance.section}`
      : "",
    attendance.remarks
      ? `Remarks: ${attendance.remarks}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await createAutomaticNotification({
    title:
      status === "absent"
        ? "Attendance Alert - Absent"
        : "Attendance Alert - Late",

    message,

    type: "attendance",

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

// Add Teacher
const addTeacher = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      name,
      email,
      phone,
      gender,
      subject,
      qualification,
      experience,
      address,
      joiningDate,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!name || !email) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedName = String(name).trim();

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    if (!normalizedName) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Teacher name is required",
      });
    }

    if (!normalizedEmail) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Teacher email is required",
      });
    }

    // ==========================================
    // CHECK EXISTING TEACHER
    // ==========================================

    const existingTeacher =
      await Teacher.findOne({
        email: normalizedEmail,
      }).session(session);

    if (existingTeacher) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Teacher with this email already exists",
      });
    }

    // ==========================================
    // CHECK EXISTING LOGIN ACCOUNT
    // ==========================================

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      }).session(session);

    if (existingUser) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // ==========================================
    // GENERATE TEMPORARY PASSWORD
    // ==========================================

    const temporaryPassword =
      generateTemporaryPassword();

    // ==========================================
    // CREATE TEACHER
    // ==========================================

    const createdTeachers =
      await Teacher.create(
        [
          {
            name: normalizedName,
            email: normalizedEmail,
            phone: phone || "",
            gender,
            subject: subject || "",
            qualification:
              qualification || "",
            experience:
              experience ?? "",
            address: address || "",
            joiningDate:
              joiningDate || undefined,
            isActive: true,
          },
        ],
        {
          session,
        }
      );

    const teacher =
      createdTeachers[0];

    // ==========================================
    // CREATE LOGIN ACCOUNT
    // ==========================================

    await User.create(
      [
        {
          name: normalizedName,
          email: normalizedEmail,
          phone: phone || "",

          // Plain temporary password.
          // User model automatically hashes it.
          password: temporaryPassword,

          role: "teacher",
          isActive: true,

          // Force password change later
          mustChangePassword: true,
        },
      ],
      {
        session,
      }
    );

    // ==========================================
    // COMMIT
    // ==========================================

    await session.commitTransaction();
	
	// ==========================================
// SEND LOGIN CREDENTIALS
// ==========================================

	const credentialDelivery =
	  await sendLoginCredentials({
		name: normalizedName,
		email: normalizedEmail,
		phone: phone || "",
		role: "teacher",
		temporaryPassword,
	  });

    return res.status(201).json({
		  success: true,

		  message:
			"Teacher added successfully with login account",

		  data: teacher,

		  loginAccountCreated: true,

		  temporaryPassword,

		  credentialDelivery,
		});
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Add teacher error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Teacher or login account with this email already exists",
      });
    }

    if (
      error?.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add teacher",
    });
  } finally {
    await session.endSession();
  }
};

// Get All Teachers
const getTeachers = async (
  req,
  res
) => {
  try {
    const teachers =
      await Teacher.find({
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error(
      "Get teachers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch teachers",
    });
  }
};

// Update Teacher
const updateTeacher = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const teacher =
      await Teacher.findById(
        req.params.id
      ).session(session);

    if (!teacher) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const oldEmail = String(
      teacher.email || ""
    )
      .trim()
      .toLowerCase();

    const allowedFields = [
      "name",
      "email",
      "phone",
      "gender",
      "subject",
      "qualification",
      "experience",
      "address",
      "joiningDate",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          req.body[field];
      }
    });

    // NAME
    if (updateData.name !== undefined) {
      if (
        typeof updateData.name !==
        "string"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Teacher name must be text",
        });
      }

      updateData.name =
        updateData.name.trim();

      if (!updateData.name) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Teacher name is required",
        });
      }
    }

    // EMAIL
    if (updateData.email !== undefined) {
      if (
        typeof updateData.email !==
        "string"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Teacher email must be text",
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
            "Teacher email is required",
        });
      }
    }

    // STRING FIELDS
    const stringFields = [
      "phone",
      "subject",
      "qualification",
      "experience",
      "address",
    ];

    for (const field of stringFields) {
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

    // GENDER
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

      if (
        ![
          "male",
          "female",
          "other",
        ].includes(updateData.gender)
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Invalid gender",
        });
      }
    }

    // STATUS
    if (
      updateData.isActive !== undefined &&
      typeof updateData.isActive !==
        "boolean"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    // ==========================================
    // LOGIN USER
    // ==========================================

    const linkedUser = oldEmail
      ? await User.findOne({
          email: oldEmail,
          role: "teacher",
        }).session(session)
      : null;

    const newEmail =
      updateData.email !== undefined
        ? updateData.email
        : oldEmail;

    // ==========================================
    // DUPLICATE EMAIL
    // ==========================================

    if (
      newEmail &&
      newEmail !== oldEmail
    ) {
      const existingTeacher =
        await Teacher.findOne({
          email: newEmail,
          _id: {
            $ne: teacher._id,
          },
        })
          .session(session)
          .select("_id")
          .lean();

      if (existingTeacher) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "Another teacher already uses this email",
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
    // UPDATE TEACHER
    // ==========================================

    Object.entries(updateData).forEach(
      ([field, value]) => {
        teacher[field] = value;
      }
    );

    await teacher.save({
      session,
    });

    // ==========================================
    // SYNC LOGIN
    // ==========================================

    if (linkedUser) {
      linkedUser.name =
        teacher.name;

      linkedUser.email =
        teacher.email;

      linkedUser.phone =
        teacher.phone || "";

      linkedUser.isActive =
        teacher.isActive;

      await linkedUser.save({
        session,
      });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Update teacher error:",
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
          "Invalid teacher ID",
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
        "Unable to update teacher",
    });
  } finally {
    await session.endSession();
  }
};

// Delete Teacher
const deleteTeacher = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const teacher =
      await Teacher.findById(
        req.params.id
      ).session(session);

    if (!teacher) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (teacher.isActive === false) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Teacher is already archived",
      });
    }

    const teacherEmail = String(
      teacher.email || ""
    )
      .trim()
      .toLowerCase();

    // ==========================================
    // 1. ARCHIVE TEACHER
    // ==========================================

    teacher.isActive = false;

    await teacher.save({
      session,
    });

    // ==========================================
    // 2. DISABLE LOGIN
    // ==========================================

    if (teacherEmail) {
      await User.updateOne(
        {
          email: teacherEmail,
          role: "teacher",
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
        "Teacher archived successfully",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Archive teacher error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive teacher",
    });
  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET ARCHIVED TEACHERS
// ==========================================

const getArchivedTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({
      isActive: false,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error(
      "Get archived teachers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch archived teachers",
    });
  }
};


// ==========================================
// RESTORE TEACHER
// ==========================================

const restoreTeacher = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const teacher = await Teacher.findById(
      req.params.id
    ).session(session);

    if (!teacher) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (teacher.isActive === true) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Teacher is already active",
      });
    }

    const teacherEmail = String(
      teacher.email || ""
    )
      .trim()
      .toLowerCase();

    if (!teacherEmail) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Teacher email is required for restore",
      });
    }

    // ==========================================
    // FIND EXISTING LOGIN ACCOUNT
    // ==========================================

    let linkedUser = await User.findOne({
      email: teacherEmail,
      role: "teacher",
    }).session(session);

    let loginAccountCreated = false;
    let temporaryPassword = null;

    // ==========================================
    // CREATE LOGIN ACCOUNT IF MISSING
    // ==========================================

    if (!linkedUser) {
      const emailUsedByAnotherUser =
        await User.findOne({
          email: teacherEmail,
        }).session(session);

      if (emailUsedByAnotherUser) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message:
            "This email is already used by another login account",
        });
      }

      // Secure random password
      temporaryPassword =
        generateTemporaryPassword();

      const createdUsers = await User.create(
        [
          {
            name: teacher.name,
            email: teacherEmail,
            password: temporaryPassword,
            role: "teacher",
            phone: teacher.phone || "",
            isActive: true,

            // First login ke baad password change karna hoga
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
      // EXISTING LOGIN ACCOUNT REACTIVATE
      // ==========================================

      linkedUser.name = teacher.name;
      linkedUser.email = teacherEmail;
      linkedUser.phone =
        teacher.phone || "";

      linkedUser.isActive = true;

      /*
        Existing User ka password aur
        mustChangePassword change nahi karenge.
      */

      await linkedUser.save({
        session,
      });
    }

    // ==========================================
    // RESTORE TEACHER PROFILE
    // ==========================================

    teacher.isActive = true;

    await teacher.save({
      session,
    });

    await session.commitTransaction();

    const restoredTeacher =
      await Teacher.findById(
        teacher._id
      ).lean();

    return res.status(200).json({
      success: true,

      message: loginAccountCreated
        ? "Teacher restored and login account created successfully"
        : "Teacher restored successfully",

      data: restoredTeacher,

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
      "Restore teacher error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email already belongs to another account",
      });
    }

    if (
      error?.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to restore teacher",
    });
  } finally {
    await session.endSession();
  }
};



// Teacher dashboard
const getTeacherDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    const myClasses = assignedClasses.length;

    let students = 0;

    if (assignedClasses.length > 0) {
      students = await Student.countDocuments({
        isActive: true,
        $or: assignedClasses.map((cls) => ({
          className: cls.className,
          section: cls.section,
        })),
      });
    }
	
	// Today's date range
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		let attendancePercentage = 0;

		if (assignedClasses.length > 0) {
		  const todayAttendance = await Attendance.find({
			date: {
			  $gte: startOfToday,
			  $lte: endOfToday,
			},
			$or: assignedClasses.map((cls) => ({
			  className: cls.className,
			  section: cls.section,
			})),
		  });

		  const totalAttendance = todayAttendance.length;

		  const presentStudents = todayAttendance.filter(
			(item) => item.status === "present" || item.status === "late"
		  ).length;

		  if (totalAttendance > 0) {
			attendancePercentage = Math.round(
			  (presentStudents / totalAttendance) * 100
			);
		  }
		}
		
		
		let upcomingExams = 0;

		if (assignedClasses.length > 0) {
		  const now = new Date();

		  upcomingExams = await Exam.countDocuments({
			isActive: true,
			examDate: { $gte: now },
			$or: assignedClasses.map((cls) => ({
			  className: cls.className,
			  section: cls.section,
			})),
		  });
		}

			res.json({
			  success: true,
			  data: {
				teacherName: teacher.name,
				subject: teacher.subject,
				myClasses,
				students,
				attendancePercentage,
				upcomingExams,
			  },
			});
		  } catch (error) {
			res.status(500).json({
			  success: false,
			  message: error.message,
			});
		  }
		};


const getMyClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const classes = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).sort({ className: 1, section: 1 });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    if (assignedClasses.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const students = await Student.find({
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    }).sort({ className: 1, section: 1, rollNumber: 1 });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyAttendanceStudents = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    if (assignedClasses.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const students = await Student.find({
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    }).sort({
      className: 1,
      section: 1,
      rollNumber: 1,
    });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const saveMyAttendance = async (req, res) => {
  try {
    const { date, attendance } = req.body;

    if (
      !date ||
      !Array.isArray(attendance)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date and attendance data are required",
      });
    }

    if (attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No attendance records provided",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    const teacher =
      await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:
          "Teacher profile not found",
      });
    }

    const assignedClasses =
      await Class.find({
        classTeacher: teacher.name,
        isActive: true,
      }).select("className section");

    if (assignedClasses.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "No classes assigned to this teacher",
      });
    }

    const allowedStudents =
      await Student.find({
        isActive: true,

        $or: assignedClasses.map(
          (cls) => ({
            className:
              cls.className,

            section:
              cls.section,
          })
        ),
      });

    const allowedStudentIds =
      new Set(
        allowedStudents.map(
          (student) =>
            student._id.toString()
        )
      );

    const studentMap = new Map(
      allowedStudents.map(
        (student) => [
          student._id.toString(),
          student,
        ]
      )
    );

    const attendanceDate =
      new Date(date);

    attendanceDate.setHours(
      0,
      0,
      0,
      0
    );

    const notificationRecords = [];

    let savedCount = 0;

    for (const item of attendance) {
      const studentId =
        String(
          item.studentId || ""
        );

      // Teacher cannot mark students
      // outside assigned classes.
      if (
        !allowedStudentIds.has(
          studentId
        )
      ) {
        continue;
      }

      const student =
        studentMap.get(
          studentId
        );

      if (!student) {
        continue;
      }

      const newStatus =
        String(
          item.status || "present"
        ).toLowerCase();

      if (
        ![
          "present",
          "absent",
          "late",
          "leave",
        ].includes(newStatus)
      ) {
        continue;
      }

      // Check old record first.
      const existingAttendance =
        await Attendance.findOne({
          studentId:
            student._id,

          date:
            attendanceDate,
        });

      const oldStatus =
        existingAttendance
          ? String(
              existingAttendance.status ||
                ""
            ).toLowerCase()
          : null;

      const savedAttendance =
        await Attendance.findOneAndUpdate(
          {
            studentId:
              student._id,

            date:
              attendanceDate,
          },

          {
            studentId:
              student._id,

            studentName:
              student.name,

            className:
              student.className,

            section:
              student.section,

            date:
              attendanceDate,

            status:
              newStatus,

            remarks:
              item.remarks || "",
          },

          {
            upsert: true,

            returnDocument:
              "after",

            setDefaultsOnInsert:
              true,

            runValidators: true,
          }
        );

      savedCount++;

      /*
        New absent/late:
        notification

        present -> absent:
        notification

        present -> late:
        notification

        absent -> late:
        notification

        absent -> absent:
        NO duplicate

        late -> late:
        NO duplicate
      */

      if (
        shouldSendAttendanceAlert(
          newStatus
        ) &&
        oldStatus !== newStatus
      ) {
        notificationRecords.push(
          savedAttendance
        );
      }
    }

    // Attendance save hone ke baad alerts.
    for (
      const record of
      notificationRecords
    ) {
      await sendTeacherAttendanceNotification(
        record,
        req.user.userId
      );
    }

    return res.json({
      success: true,

      message:
        "Attendance saved successfully",

      savedCount,

      alertsGenerated:
        notificationRecords.length,
    });
  } catch (error) {
    console.error(
      "Teacher attendance save error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
		  email: user.email,
		  isActive: true,
		});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    });

    res.json({
      success: true,
      data: records,
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

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    if (assignedClasses.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const exams = await Exam.find({
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
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

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    if (assignedClasses.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const students = await Student.find({
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    }).select("_id");

    const studentIds = students.map((student) => student._id);

    const results = await Result.find({
      studentId: { $in: studentIds },
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

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...teacher.toObject(),
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



const addMyResult = async (req, res) => {
  try {
    const {
      studentId,
      examId,
      obtainedMarks,
      remarks,
    } = req.body;

    if (!studentId || !examId || obtainedMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Student, exam and obtained marks are required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    const student = await Student.findOne({
      _id: studentId,
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You cannot add result for this student",
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    });

    if (!exam) {
      return res.status(403).json({
        success: false,
        message: "You cannot add result for this exam",
      });
    }
	
	if (
  teacher.subject &&
  normalizeSubject(exam.subjectName) !==
    normalizeSubject(teacher.subject)
) {
  return res.status(403).json({
    success: false,
    message: "You can only add results for your own subject",
  });
}

    const marks = Number(obtainedMarks);

    if (marks < 0 || marks > exam.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${exam.totalMarks}`,
      });
    }

    const percentage =
      exam.totalMarks > 0
        ? Math.round((marks / exam.totalMarks) * 100)
        : 0;

    let grade = "F";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    const result = await Result.create({
      studentId: student._id,
      studentName: student.name,
      examId: exam._id,
      examName: exam.examName,
      subjectName: exam.subjectName,
      totalMarks: exam.totalMarks,
      obtainedMarks: marks,
      percentage,
      grade,
      remarks: remarks || "",
    });
	
	const targetUsers =
	  await getStudentAndParentUserIds(
		student._id
	  );

	if (targetUsers.length > 0) {
	  const message = [
		`Student: ${student.name}`,
		`Exam: ${exam.examName}`,
		`Subject: ${exam.subjectName}`,
		`Marks: ${marks}/${exam.totalMarks}`,
		`Percentage: ${percentage}%`,
		`Grade: ${grade}`,
		remarks
		  ? `Remarks: ${remarks}`
		  : "",
	  ]
		.filter(Boolean)
		.join("\n");

	  await createAutomaticNotification({
		title: "Result Published",

		message,

		type: "result",

		targetType: "user",

		targetUsers,

		createdBy:
		  req.user.userId,

		channels: {
		  inApp: true,
		  email: true,
		  whatsapp: true,
		},
	  });
	}

    res.status(201).json({
      success: true,
      message: "Result added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateMyResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { obtainedMarks, remarks } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }
	
	const exam = await Exam.findById(result.examId);

		if (!exam) {
		  return res.status(404).json({
			success: false,
			message: "Exam not found",
		  });
		}

		if (
  teacher.subject &&
  normalizeSubject(exam.subjectName) !==
    normalizeSubject(teacher.subject)
) {
  return res.status(403).json({
    success: false,
    message: "You can only add results for your own subject",
  });
}


    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    const student = await Student.findOne({
      _id: result.studentId,
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this result",
      });
    }

    const marks = Number(obtainedMarks);

    if (marks < 0 || marks > result.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${result.totalMarks}`,
      });
    }

    const percentage =
      result.totalMarks > 0
        ? Math.round((marks / result.totalMarks) * 100)
        : 0;

    let grade = "F";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    result.obtainedMarks = marks;
    result.percentage = percentage;
    result.grade = grade;
    result.remarks = remarks || "";

    await result.save();
	
	const targetUsers =
	  await getStudentAndParentUserIds(
		result.studentId
	  );

	if (targetUsers.length > 0) {
	  const message = [
		`Student: ${result.studentName}`,
		`Exam: ${result.examName}`,
		`Subject: ${result.subjectName}`,
		`Marks: ${result.obtainedMarks}/${result.totalMarks}`,
		`Percentage: ${result.percentage}%`,
		`Grade: ${result.grade}`,
		result.remarks
		  ? `Remarks: ${result.remarks}`
		  : "",
	  ]
		.filter(Boolean)
		.join("\n");

	  await createAutomaticNotification({
		title: "Result Updated",

		message,

		type: "result",

		targetType: "user",

		targetUsers,

		createdBy:
		  req.user.userId,

		channels: {
		  inApp: true,
		  email: true,
		  whatsapp: true,
		},
	  });
	}

    res.json({
      success: true,
      message: "Result updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const deleteMyResult = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }
	
	const exam = await Exam.findById(result.examId);

		if (!exam) {
		  return res.status(404).json({
			success: false,
			message: "Exam not found",
		  });
		}

		if (
  teacher.subject &&
  normalizeSubject(exam.subjectName) !==
    normalizeSubject(teacher.subject)
) {
  return res.status(403).json({
    success: false,
    message: "You can only add results for your own subject",
  });
}
	

    const assignedClasses = await Class.find({
      classTeacher: teacher.name,
      isActive: true,
    }).select("className section");

    const student = await Student.findOne({
      _id: result.studentId,
      isActive: true,
      $or: assignedClasses.map((cls) => ({
        className: cls.className,
        section: cls.section,
      })),
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this result",
      });
    }

    await Result.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const normalizeSubject = (subject) => {
  const value = subject.toLowerCase().trim();

  const subjectMap = {
    math: "mathematics",
    maths: "mathematics",
    mathematics: "mathematics",

    computer: "computer",
    "computer science": "computer",

    english: "english",

    science: "science",

    hindi: "hindi",
  };

  return subjectMap[value] || value;
};


const updateMyProfile = async (req, res) => {
  try {
    const {
      phone,
      qualification,
      experience,
      address,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const teacher = await Teacher.findOne({
	  email: user.email,
	  isActive: true,
	});

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    teacher.phone = phone ?? teacher.phone;
    teacher.qualification = qualification ?? teacher.qualification;
    teacher.experience = experience ?? teacher.experience;
    teacher.address = address ?? teacher.address;

    await teacher.save();

    // User collection me phone bhi sync kar dete hain
    if (phone !== undefined) {
      user.phone = phone;
      await user.save();
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




module.exports = {
  addTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  getTeacherDashboard,
  getMyClasses,
  getMyStudents,
  getMyAttendanceStudents,
  saveMyAttendance,
  getMyAttendanceByDate,
  getMyExams,
  getMyResults,
  getMyProfile,
  addMyResult,
  updateMyResult,
  deleteMyResult,
  updateMyProfile,
  getArchivedTeachers,
  restoreTeacher,
};