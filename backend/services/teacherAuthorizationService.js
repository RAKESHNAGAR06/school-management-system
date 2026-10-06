const mongoose = require("mongoose");

const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Exam = require("../models/Exam");
const User = require("../models/User");


// ==========================================
// NORMALIZE
// ==========================================

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase();


// ==========================================
// GET LOGGED-IN TEACHER
// ==========================================

const getLoggedInTeacher = async (
  userId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      userId
    )
  ) {
    throw new Error(
      "Invalid teacher user ID"
    );
  }

  const user =
    await User.findOne({
      _id: userId,
      role: "teacher",
      isActive: true,
    })
      .select(
        "_id name email role"
      )
      .lean();

  if (!user) {
    throw new Error(
      "Teacher user account not found"
    );
  }

  const normalizedEmail =
    normalize(user.email);

  if (!normalizedEmail) {
    throw new Error(
      "Teacher login account has no valid email"
    );
  }

  const teacher =
    await Teacher.findOne({
      email: normalizedEmail,
      isActive: true,
    })
      .select(
        "_id name email subject isActive"
      )
      .lean();

  if (!teacher) {
    throw new Error(
      "Teacher profile not found"
    );
  }

  return teacher;
};


// ==========================================
// GET TEACHER ASSIGNMENTS
// ==========================================

const getTeacherAssignments = async (
  userId
) => {
  const teacher =
    await getLoggedInTeacher(userId);

  const teacherName =
    String(
      teacher.name || ""
    ).trim();

  if (!teacherName) {
    throw new Error(
      "Teacher profile has no valid name"
    );
  }

  const [classes, subjects] =
    await Promise.all([
      Class.find({
        classTeacher:
          teacherName,

        isActive: true,
      })
        .select(
          "_id className section classTeacher"
        )
        .lean(),

      Subject.find({
        teacherName:
          teacherName,

        isActive: true,
      })
        .select(
          "_id subjectName className teacherName"
        )
        .lean(),
    ]);

  return {
    teacher,
    classes,
    subjects,
  };
};


// ==========================================
// CAN ACCESS STUDENT
// ==========================================

const canAccessStudent = async (
  userId,
  studentId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    return {
      allowed: false,
      student: null,
      accessType: null,
      allowedSubjects: [],
      canViewAttendance: false,
    };
  }

  const { classes, subjects } =
    await getTeacherAssignments(
      userId
    );

  const student =
    await Student.findOne({
      _id: studentId,
      isActive: true,
    })
      .select(
        "_id name className section rollNumber"
      )
      .lean();

  if (!student) {
    return {
      allowed: false,
      student: null,
      accessType: null,
      allowedSubjects: [],
      canViewAttendance: false,
    };
  }

  // ------------------------------------------
  // CLASS TEACHER
  // Exact class + section required
  // ------------------------------------------

  const isClassTeacher =
    classes.some(
      (item) =>
        normalize(
          item.className
        ) ===
          normalize(
            student.className
          ) &&
        normalize(
          item.section
        ) ===
          normalize(
            student.section
          )
    );


  // ------------------------------------------
  // SUBJECT TEACHER
  // Current Subject schema has no section.
  // Therefore subject assignment is currently
  // class-level.
  // ------------------------------------------

  const matchingSubjects =
    subjects.filter(
      (item) =>
        normalize(
          item.className
        ) ===
        normalize(
          student.className
        )
    );


  const allowedSubjects = [
    ...new Set(
      matchingSubjects
        .map((item) =>
          String(
            item.subjectName || ""
          ).trim()
        )
        .filter(Boolean)
    ),
  ];


  const isSubjectTeacher =
    allowedSubjects.length > 0;


  // ------------------------------------------
  // ACCESS TYPE
  // ------------------------------------------

  let accessType = null;

  if (isClassTeacher) {
    accessType =
      "classTeacher";
  } else if (
    isSubjectTeacher
  ) {
    accessType =
      "subjectTeacher";
  }


  return {
    allowed:
      isClassTeacher ||
      isSubjectTeacher,

    student,

    accessType,

    /*
      Class teacher may access all subjects
      for students in their exact class/section.

      Subject teacher receives only subjects
      actually assigned to them.
    */
    allowedSubjects:
      isClassTeacher
        ? []
        : allowedSubjects,

    /*
      Attendance is intentionally restricted
      to the exact class teacher.

      Subject assignment alone does not grant
      full attendance-history access.
    */
    canViewAttendance:
      isClassTeacher,
  };
};


// ==========================================
// CAN ACCESS CLASS ATTENDANCE
// Exact class-teacher authorization only
// ==========================================

const canAccessClassAttendance =
  async ({
    userId,
    className,
    section,
  }) => {
    const cleanClassName =
      normalize(className);

    const cleanSection =
      normalize(section);

    /*
      Attendance is section-specific.

      Never allow an empty section because
      Class 10 without section could otherwise
      expose attendance across 10-A, 10-B, etc.
    */

    if (
      !cleanClassName ||
      !cleanSection
    ) {
      return false;
    }

    const { classes } =
      await getTeacherAssignments(
        userId
      );

    return classes.some(
      (item) =>
        normalize(
          item.className
        ) ===
          cleanClassName &&
        normalize(
          item.section
        ) ===
          cleanSection
    );
  };



// ==========================================
// CAN ACCESS CLASS + SUBJECT
// ==========================================

const canAccessClassSubject =
  async ({
    userId,
    className,
    section = "",
    subjectName = "",
  }) => {
    const cleanClassName =
      normalize(className);

    const cleanSection =
      normalize(section);

    const cleanSubjectName =
      normalize(subjectName);

    if (!cleanClassName) {
      return false;
    }

    const {
      classes,
      subjects,
    } =
      await getTeacherAssignments(
        userId
      );


    // ------------------------------------------
    // CLASS TEACHER ACCESS
    // ------------------------------------------

    const isClassTeacher =
      classes.some(
        (item) => {
          if (
            normalize(
              item.className
            ) !==
            cleanClassName
          ) {
            return false;
          }

          /*
            If a section is supplied, it MUST
            exactly match the assigned section.

            If no section is supplied, do not
            silently grant class-teacher access
            because that could broaden A -> all
            sections of the same class.
          */

          if (!cleanSection) {
            return false;
          }

          return (
            normalize(
              item.section
            ) ===
            cleanSection
          );
        }
      );


    // ------------------------------------------
    // SUBJECT TEACHER ACCESS
    // ------------------------------------------

    const isSubjectTeacher =
      subjects.some(
        (item) => {
          if (
            normalize(
              item.className
            ) !==
            cleanClassName
          ) {
            return false;
          }

          /*
            When an endpoint is requesting a
            specific subject, exact subject
            assignment is mandatory.
          */

          if (
            cleanSubjectName &&
            normalize(
              item.subjectName
            ) !==
              cleanSubjectName
          ) {
            return false;
          }

          /*
            Current Subject schema does not
            contain section.

            Therefore section cannot currently
            be verified for subject teachers.
            This remains class-level subject
            access until Subject gets a section
            or classId relation.
          */

          return true;
        }
      );


    return (
      isClassTeacher ||
      isSubjectTeacher
    );
  };


// ==========================================
// GET AUTHORIZED EXAM
// ==========================================

const getAuthorizedExam = async (
  userId,
  examId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      examId
    )
  ) {
    return {
      allowed: false,
      exam: null,
    };
  }

  const exam =
    await Exam.findOne({
      _id: examId,
      isActive: true,
    })
      .select(
        "_id examName className section subjectName totalMarks examDate isActive"
      )
      .lean();

  if (!exam) {
    return {
      allowed: false,
      exam: null,
    };
  }

  /*
    Exam authorization requires authoritative
    values stored in the Exam itself.

    Nothing from req.body is trusted for
    class/subject authorization.
  */

  const allowed =
    await canAccessClassSubject({
      userId,

      className:
        exam.className,

      section:
        exam.section || "",

      subjectName:
        exam.subjectName,
    });


  return {
    allowed,
    exam,
  };
};


module.exports = {
  getLoggedInTeacher,
  getTeacherAssignments,
  canAccessStudent,
  canAccessClassAttendance,
  canAccessClassSubject,
  getAuthorizedExam,
};