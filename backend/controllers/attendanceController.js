const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const {
  createAutomaticNotification,
  getStudentAndParentUserIds,
} = require("../services/notificationService");

// ==========================================
// HELPERS
// ==========================================

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

// ==========================================
// SEND ATTENDANCE NOTIFICATION
// ==========================================

const sendAttendanceNotification = async (
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
      `Attendance notification skipped for ${attendance.studentName}: no linked Student/Parent User accounts found`
    );

    return;
  }

  const attendanceDate =
    formatAttendanceDate(attendance.date);

  const isAbsent = status === "absent";

  const title = isAbsent
    ? "Attendance Alert - Absent"
    : "Attendance Alert - Late";

  const message = [
    `Student: ${attendance.studentName}`,

    attendanceDate
      ? `Date: ${attendanceDate}`
      : "",

    `Status: ${
      isAbsent ? "Absent" : "Late"
    }`,

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
    title,

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

// ==========================================
// ADD ATTENDANCE
// ==========================================

const addAttendance = async (req, res) => {
  try {
    const {
      studentId,
      date,
      status = "present",
      remarks = "",
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!studentId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Student and date are required",
      });
    }

    const attendanceDate =
      new Date(date);

    if (
      Number.isNaN(
        attendanceDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attendance date",
      });
    }

    attendanceDate.setHours(
      0,
      0,
      0,
      0
    );

    const normalizedStatus =
      String(status)
        .trim()
        .toLowerCase();

    const allowedStatuses = [
      "present",
      "absent",
      "late",
      "leave",
    ];

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attendance status",
      });
    }

    // ==========================================
    // AUTHORITATIVE STUDENT DATA
    // ==========================================

    const student =
      await Student.findOne({
        _id: studentId,
        isActive: true,
      }).select(
        "_id name className section"
      );

    if (!student) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot add attendance. Student does not exist or is archived.",
      });
    }

    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    const existingAttendance =
      await Attendance.findOne({
        studentId: student._id,
        date: attendanceDate,
      }).select("_id");

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student on this date already exists",
      });
    }

    // ==========================================
    // CREATE TRUSTED RECORD
    // ==========================================

    const attendance =
      await Attendance.create({
        studentId: student._id,

        studentName:
          student.name,

        className:
          student.className || "",

        section:
          student.section || "",

        date: attendanceDate,

        status:
          normalizedStatus,

        remarks:
          typeof remarks === "string"
            ? remarks.trim()
            : "",
      });

    // ==========================================
    // AUTOMATIC NOTIFICATION
    // ==========================================

    if (
      shouldSendAttendanceAlert(
        attendance.status
      )
    ) {
      try {
        await sendAttendanceNotification(
          attendance,
          req.user.userId
        );
      } catch (notificationError) {
        console.error(
          "Attendance notification error:",
          notificationError
        );
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Attendance added successfully",
      data: attendance,
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
          "Attendance for this student on this date already exists",
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
      "Add attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add attendance",
    });
  }
};

// ==========================================
// GET ATTENDANCE
// ==========================================

const getAttendance = async (req, res) => {
  try {
    const attendance =
      await Attendance.find()
        .populate(
          "studentId",
          "name email className section rollNumber"
        )
        .sort({
          date: -1,
        });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ATTENDANCE BY ID
// ==========================================

const getAttendanceById = async (
  req,
  res
) => {
  try {
    const attendance =
      await Attendance.findById(
        req.params.id
      ).populate(
        "studentId",
        "name email className section rollNumber"
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ATTENDANCE
// ==========================================

const updateAttendance = async (
  req,
  res
) => {
  try {
    const existingAttendance =
      await Attendance.findById(
        req.params.id
      );

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance not found",
      });
    }

    const {
      studentId =
        existingAttendance.studentId,
      date =
        existingAttendance.date,
      status =
        existingAttendance.status,
      remarks =
        existingAttendance.remarks,
    } = req.body;

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    const attendanceDate =
      new Date(date);

    if (
      Number.isNaN(
        attendanceDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attendance date",
      });
    }

    attendanceDate.setHours(
      0,
      0,
      0,
      0
    );

    // ==========================================
    // STATUS VALIDATION
    // ==========================================

    const normalizedStatus =
      String(status)
        .trim()
        .toLowerCase();

    const allowedStatuses = [
      "present",
      "absent",
      "late",
      "leave",
    ];

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attendance status",
      });
    }

    // ==========================================
    // ACTIVE STUDENT VALIDATION
    // ==========================================

    const student =
      await Student.findOne({
        _id: studentId,
        isActive: true,
      }).select(
        "_id name className section"
      );

    if (!student) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update attendance. Student does not exist or is archived.",
      });
    }

    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    const duplicateAttendance =
      await Attendance.findOne({
        _id: {
          $ne: existingAttendance._id,
        },

        studentId:
          student._id,

        date:
          attendanceDate,
      }).select("_id");

    if (duplicateAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student on this date already exists",
      });
    }

    const oldStatus =
      String(
        existingAttendance.status ||
          ""
      ).toLowerCase();

    // ==========================================
    // SERVER-CONTROLLED UPDATE
    // ==========================================

    existingAttendance.studentId =
      student._id;

    existingAttendance.studentName =
      student.name;

    existingAttendance.className =
      student.className || "";

    existingAttendance.section =
      student.section || "";

    existingAttendance.date =
      attendanceDate;

    existingAttendance.status =
      normalizedStatus;

    existingAttendance.remarks =
      typeof remarks === "string"
        ? remarks.trim()
        : "";

    const attendance =
      await existingAttendance.save();

    const newStatus =
      String(
        attendance.status || ""
      ).toLowerCase();

    // ==========================================
    // NOTIFICATION
    // ==========================================

    if (
      shouldSendAttendanceAlert(
        newStatus
      ) &&
      oldStatus !== newStatus
    ) {
      try {
        await sendAttendanceNotification(
          attendance,
          req.user.userId
        );
      } catch (notificationError) {
        console.error(
          "Attendance notification error:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attendance or student ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student on this date already exists",
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
      "Update attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update attendance",
    });
  }
};

// ==========================================
// BULK ATTENDANCE
// ==========================================

const addBulkAttendance = async (req, res) => {
  try {
    const {
		  date,
		  records,
		} = req.body;

    if (
      !date ||
      !Array.isArray(records)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date and attendance records are required",
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No attendance records provided",
      });
    }
	
	const attendanceDate =
	  new Date(date);

	if (
	  Number.isNaN(
		attendanceDate.getTime()
	  )
	) {
	  return res.status(400).json({
		success: false,
		message:
		  "Invalid attendance date",
	  });
	}

	attendanceDate.setHours(
	  0,
	  0,
	  0,
	  0
	);

    // ==========================================
    // BASIC RECORD VALIDATION
    // ==========================================

    const invalidRecord =
      records.find(
        (record) =>
          !record ||
          !record.studentId
      );

    if (invalidRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Every attendance record must contain a student ID",
      });
    }

    // ==========================================
    // GET ALL ACTIVE STUDENTS AT ONCE
    // ==========================================

    const studentIds = [
      ...new Set(
        records.map((record) =>
          String(record.studentId)
        )
      ),
    ];

    const activeStudents =
      await Student.find({
        _id: {
          $in: studentIds,
        },
        isActive: true,
      }).select(
        "_id name className section"
      );

    const activeStudentMap =
      new Map(
        activeStudents.map(
          (student) => [
            String(student._id),
            student,
          ]
        )
      );

    const unavailableRecords =
      records.filter(
        (record) =>
          !activeStudentMap.has(
            String(record.studentId)
          )
      );

    if (unavailableRecords.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Bulk attendance contains archived or unavailable students. Refresh the student list and try again.",
        unavailableStudentIds:
          unavailableRecords.map(
            (record) =>
              record.studentId
          ),
      });
    }

    // ==========================================
    // BUILD TRUSTED ATTENDANCE RECORDS
    // ==========================================

    const attendanceRecords =
      records.map((record) => {
        const student =
          activeStudentMap.get(
            String(record.studentId)
          );

        return {
          studentId:
            student._id,

          // Backend-controlled snapshot
          studentName:
            student.name,

          className:
		    student.className || "",

		  section:
		    student.section || "",

          date: attendanceDate,

          status:
            record.status,

          remarks:
            typeof record.remarks ===
            "string"
              ? record.remarks.trim()
              : "",
        };
      });

    const savedRecords = [];
    const notificationRecords = [];

    // ==========================================
    // SAVE / UPDATE ATTENDANCE
    // ==========================================

    for (
      const record of attendanceRecords
    ) {
      const existingAttendance =
        await Attendance.findOne({
          studentId:
            record.studentId,
          date:
            record.date,
        });

      if (existingAttendance) {
        const oldStatus =
          String(
            existingAttendance.status ||
              ""
          ).toLowerCase();

        existingAttendance.studentName =
          record.studentName;

        existingAttendance.className =
          record.className;

        existingAttendance.section =
          record.section;

        existingAttendance.status =
          record.status;

        existingAttendance.remarks =
          record.remarks;

        const updated =
          await existingAttendance.save();

        savedRecords.push(updated);

        const newStatus =
          String(
            updated.status || ""
          ).toLowerCase();

        if (
          shouldSendAttendanceAlert(
            newStatus
          ) &&
          oldStatus !== newStatus
        ) {
          notificationRecords.push(
            updated
          );
        }
      } else {
        const created =
          await Attendance.create(
            record
          );

        savedRecords.push(created);

        if (
          shouldSendAttendanceAlert(
            created.status
          )
        ) {
          notificationRecords.push(
            created
          );
        }
      }
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    for (
      const attendance of
      notificationRecords
    ) {
      try {
        await sendAttendanceNotification(
          attendance,
          req.user.userId
        );
      } catch (
        notificationError
      ) {
        console.error(
          "Attendance notification error:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Bulk attendance saved successfully",
      count:
        savedRecords.length,
      alertsGenerated:
        notificationRecords.length,
      data: savedRecords,
    });
  } catch (error) {
    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more student IDs are invalid",
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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate attendance record detected",
      });
    }

    console.error(
      "Bulk attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save bulk attendance",
    });
  }
};

// ==========================================
// DELETE ATTENDANCE
// ==========================================

const deleteAttendance = async (
  req,
  res
) => {
  try {
    const attendance =
      await Attendance.findByIdAndDelete(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Attendance deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAttendance,
  addBulkAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};