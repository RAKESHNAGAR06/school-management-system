const Timetable = require("../models/Timetable");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const {
  createAutomaticNotification,
} = require("../services/notificationService");


const isValidTimeRange = (startTime, endTime) => {
  return startTime && endTime && startTime < endTime;
};

const findActiveTeacherByName =
  async (teacherName) => {
    const name =
      String(
        teacherName || ""
      ).trim();

    if (!name) {
      return null;
    }

    return Teacher.findOne({
      name: {
        $regex:
          `^${name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
        $options: "i",
      },
      isActive: true,
    }).select(
      "_id name email subject"
    );
  };


const sendTimetableNotification = async ({
  timetable,
  createdBy,
  action,
}) => {
  let title = "Timetable Updated";

  if (action === "created") {
    title = "New Timetable Scheduled";
  } else if (action === "deleted") {
    title = "Timetable Cancelled";
  }

  const message = [
    `Class: ${timetable.className}${
      timetable.section ? ` - ${timetable.section}` : ""
    }`,
    `Day: ${timetable.day}`,
    `Subject: ${timetable.subjectName}`,
    timetable.teacherName
      ? `Teacher: ${timetable.teacherName}`
      : "",
    `Time: ${timetable.startTime} - ${timetable.endTime}`,
    timetable.roomNumber
      ? `Room: ${timetable.roomNumber}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  await createAutomaticNotification({
    title,
    message,
    type: "timetable",

    targetType: "class",
    className: timetable.className,
    section: timetable.section || "",

    createdBy,

    channels: {
      inApp: true,
      email: true,
      whatsapp: true,
    },
  });
};


const addTimetable = async (
  req,
  res
) => {
  try {
    const {
      className,
      section,
      day,
      subjectName,
      teacherName,
      startTime,
      endTime,
      roomNumber,
    } = req.body;

    if (
      !className ||
      !day ||
      !subjectName ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class, day, subject, start time and end time are required",
      });
    }

    if (
      !isValidTimeRange(
        startTime,
        endTime
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be greater than start time",
      });
    }

    let verifiedTeacherName =
      "";

    // ==========================================
    // ACTIVE TEACHER CHECK
    // ==========================================

    if (
      String(
        teacherName || ""
      ).trim()
    ) {
      const teacher =
        await findActiveTeacherByName(
          teacherName
        );

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message:
            "Selected teacher does not exist or is archived",
        });
      }

      /*
        Store canonical DB name instead of
        trusting frontend spelling/casing.
      */
      verifiedTeacherName =
        teacher.name;
    }

    const cleanClassName =
      String(className).trim();

    const cleanSection =
      String(
        section || ""
      ).trim();

    const cleanDay =
      String(day).trim();

    const cleanSubject =
      String(
        subjectName
      ).trim();

    const cleanRoom =
      String(
        roomNumber || ""
      ).trim();

    // ==========================================
    // CLASS CONFLICT
    // ==========================================

    const conflict =
      await Timetable.findOne({
        className:
          cleanClassName,

        section:
          cleanSection,

        day:
          cleanDay,

        isActive: true,

        startTime: {
          $lt: endTime,
        },

        endTime: {
          $gt: startTime,
        },
      });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This class already has a timetable in this time slot",
      });
    }

    // ==========================================
    // TEACHER CONFLICT
    // ==========================================

    if (verifiedTeacherName) {
      const teacherConflict =
        await Timetable.findOne({
          teacherName:
            verifiedTeacherName,

          day:
            cleanDay,

          isActive: true,

          startTime: {
            $lt: endTime,
          },

          endTime: {
            $gt: startTime,
          },
        });

      if (teacherConflict) {
        return res.status(409).json({
          success: false,
          message:
            "This teacher already has a class in this time slot",
        });
      }
    }

    // ==========================================
    // ROOM CONFLICT
    // ==========================================

    if (cleanRoom) {
      const roomConflict =
        await Timetable.findOne({
          roomNumber:
            cleanRoom,

          day:
            cleanDay,

          isActive: true,

          startTime: {
            $lt: endTime,
          },

          endTime: {
            $gt: startTime,
          },
        });

      if (roomConflict) {
        return res.status(409).json({
          success: false,
          message:
            "This room is already occupied in this time slot",
        });
      }
    }

    const timetable =
      await Timetable.create({
        className:
          cleanClassName,

        section:
          cleanSection,

        day:
          cleanDay,

        subjectName:
          cleanSubject,

        teacherName:
          verifiedTeacherName,

        startTime,
        endTime,

        roomNumber:
          cleanRoom,
      });

    await sendTimetableNotification({
      timetable,
      createdBy:
        req.user.userId,
      action: "created",
    });

    return res.status(201).json({
      success: true,
      message:
        "Timetable added successfully",
      data: timetable,
    });
  } catch (error) {
    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Add timetable error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add timetable",
    });
  }
};


const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find({
      isActive: true,
    }).sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteTimetable = async (
  req,
  res
) => {
  try {
    const timetable =
      await Timetable.findById(
        req.params.id
      );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message:
          "Timetable entry not found",
      });
    }

    await Timetable.findByIdAndDelete(
      req.params.id
    );

    await sendTimetableNotification({
      timetable,
      createdBy:
        req.user.userId,
      action: "deleted",
    });

    return res.json({
      success: true,
      message:
        "Timetable deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete timetable error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTimetable = async (
  req,
  res
) => {
  try {
    const timetable =
      await Timetable.findById(
        req.params.id
      );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message:
          "Timetable entry not found",
      });
    }

    const oldClassName =
      timetable.className;

    const oldSection =
      timetable.section || "";

    const {
      className,
      section,
      day,
      subjectName,
      teacherName,
      startTime,
      endTime,
      roomNumber,
    } = req.body;

    const updatedClassName =
      className !== undefined
        ? String(
            className
          ).trim()
        : timetable.className;

    const updatedSection =
      section !== undefined
        ? String(
            section || ""
          ).trim()
        : timetable.section || "";

    const updatedDay =
      day !== undefined
        ? String(day).trim()
        : timetable.day;

    const updatedSubjectName =
      subjectName !== undefined
        ? String(
            subjectName
          ).trim()
        : timetable.subjectName;

    const updatedStartTime =
      startTime ??
      timetable.startTime;

    const updatedEndTime =
      endTime ??
      timetable.endTime;

    const updatedRoomNumber =
      roomNumber !== undefined
        ? String(
            roomNumber || ""
          ).trim()
        : timetable.roomNumber || "";

    let updatedTeacherName =
      teacherName !== undefined
        ? String(
            teacherName || ""
          ).trim()
        : timetable.teacherName || "";

    if (
      !updatedClassName ||
      !updatedDay ||
      !updatedSubjectName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class, day and subject are required",
      });
    }

    if (
      !isValidTimeRange(
        updatedStartTime,
        updatedEndTime
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be greater than start time",
      });
    }

    // ==========================================
    // ACTIVE TEACHER CHECK
    // ==========================================

    if (updatedTeacherName) {
      const teacher =
        await findActiveTeacherByName(
          updatedTeacherName
        );

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message:
            "Selected teacher does not exist or is archived",
        });
      }

      updatedTeacherName =
        teacher.name;
    }

    // ==========================================
    // CLASS CONFLICT
    // ==========================================

    const conflict =
      await Timetable.findOne({
        _id: {
          $ne: timetable._id,
        },

        className:
          updatedClassName,

        section:
          updatedSection,

        day:
          updatedDay,

        isActive: true,

        startTime: {
          $lt: updatedEndTime,
        },

        endTime: {
          $gt: updatedStartTime,
        },
      });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This class already has a timetable in this time slot",
      });
    }

    // ==========================================
    // TEACHER CONFLICT
    // ==========================================

    if (updatedTeacherName) {
      const teacherConflict =
        await Timetable.findOne({
          _id: {
            $ne: timetable._id,
          },

          teacherName:
            updatedTeacherName,

          day:
            updatedDay,

          isActive: true,

          startTime: {
            $lt: updatedEndTime,
          },

          endTime: {
            $gt: updatedStartTime,
          },
        });

      if (teacherConflict) {
        return res.status(409).json({
          success: false,
          message:
            "This teacher already has a class in this time slot",
        });
      }
    }

    // ==========================================
    // ROOM CONFLICT
    // ==========================================

    if (updatedRoomNumber) {
      const roomConflict =
        await Timetable.findOne({
          _id: {
            $ne: timetable._id,
          },

          roomNumber:
            updatedRoomNumber,

          day:
            updatedDay,

          isActive: true,

          startTime: {
            $lt: updatedEndTime,
          },

          endTime: {
            $gt: updatedStartTime,
          },
        });

      if (roomConflict) {
        return res.status(409).json({
          success: false,
          message:
            "This room is already occupied in this time slot",
        });
      }
    }

    // ==========================================
    // SAVE
    // ==========================================

    timetable.className =
      updatedClassName;

    timetable.section =
      updatedSection;

    timetable.day =
      updatedDay;

    timetable.subjectName =
      updatedSubjectName;

    timetable.teacherName =
      updatedTeacherName;

    timetable.startTime =
      updatedStartTime;

    timetable.endTime =
      updatedEndTime;

    timetable.roomNumber =
      updatedRoomNumber;

    await timetable.save();

    const classChanged =
      oldClassName !==
        timetable.className ||
      oldSection !==
        (timetable.section || "");

    if (classChanged) {
      await createAutomaticNotification({
        title:
          "Timetable Schedule Changed",

        message:
          `The ${timetable.subjectName} timetable previously assigned to ` +
          `${oldClassName}${
            oldSection
              ? ` - ${oldSection}`
              : ""
          } has been moved or changed. ` +
          "Please check the latest timetable.",

        type:
          "timetable",

        targetType:
          "class",

        className:
          oldClassName,

        section:
          oldSection,

        createdBy:
          req.user.userId,

        channels: {
          inApp: true,
          email: true,
          whatsapp: true,
        },
      });
    }

    await sendTimetableNotification({
      timetable,
      createdBy:
        req.user.userId,
      action: "updated",
    });

    return res.status(200).json({
      success: true,
      message:
        "Timetable updated successfully",
      data: timetable,
    });
  } catch (error) {
    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid timetable ID",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Update timetable error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update timetable",
    });
  }
};



const getTeacherTimetable = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const teacher = await Teacher.findOne({
      email: user.email,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const timetable = await Timetable.find({
      teacherName: teacher.name,
      isActive: true,
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getStudentTimetable = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const student = await Student.findOne({
      email: user.email,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const timetable = await Timetable.find({
      className: student.className,
      section: student.section,
      isActive: true,
    });

    res.json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getParentTimetable = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const parent = await Parent.findOne({
      email: user.email,
    }).populate("studentId");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    if (!parent.studentId) {
      return res.status(404).json({
        success: false,
        message: "Student not linked with this parent",
      });
    }

    const student = parent.studentId;

    const timetable = await Timetable.find({
      className: student.className,
      section: student.section,
      isActive: true,
    });

    res.json({
      success: true,
      count: timetable.length,
      student: {
        name: student.name,
        className: student.className,
        section: student.section,
      },
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addTimetable,
  getTimetables,
  deleteTimetable,
  updateTimetable,
  getTeacherTimetable,
  getStudentTimetable,
  getParentTimetable,
};