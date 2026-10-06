const User = require("../models/User");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Fee = require("../models/Fee");
const Exam = require("../models/Exam");
const Homework = require("../models/Homework");
const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// ======================================================
// HELPERS
// ======================================================

const normalize = (value = "") =>
  String(value).trim().toLowerCase();

const calculatePercentage = (
  present,
  total
) => {
  if (!total) return null;

  return Number(
    ((present / total) * 100).toFixed(2)
  );
};

const buildAttendanceStats = (
  records = []
) => {
  const stats = {
    totalRecords: records.length,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    attendancePercentage: null,
  };

  records.forEach((item) => {
    if (
      stats[item.status] !== undefined
    ) {
      stats[item.status]++;
    }
  });

  stats.attendancePercentage =
    calculatePercentage(
      stats.present,
      stats.totalRecords
    );

  return stats;
};

// ======================================================
// STUDENT / PARENT SUMMARY
// ======================================================

const getStudentSummary = async (
  student
) => {
  if (!student) return null;

  /*
   * We intentionally keep raw record limits small.
   *
   * Aggregate values are calculated separately so
   * important totals do not depend on the recent
   * record limits.
   */

  const [
    recentAttendance,
    recentResults,
    recentFees,
    exams,
    homework,
    timetable,
    attendanceAggregate,
    feeAggregate,
  ] = await Promise.all([
    // ------------------------------------------
    // Recent attendance
    // ------------------------------------------

    Attendance.find({
      studentId: student._id,
    })
      .sort({ date: -1 })
      .limit(30)
      .select("date status")
      .lean(),

    // ------------------------------------------
    // Recent academic results
    // ------------------------------------------

    Result.find({
      studentId: student._id,
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .select(
        "examName subjectName totalMarks obtainedMarks percentage grade"
      )
      .lean(),

    // ------------------------------------------
    // Recent fee records
    // ------------------------------------------

    Fee.find({
      studentId: student._id,
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .select(
        "feeType amount paidAmount dueAmount dueDate status"
      )
      .lean(),

    // ------------------------------------------
    // Upcoming/current exams
    // ------------------------------------------

    Exam.find({
      className: student.className,
      section: student.section,
      isActive: true,
    })
      .sort({ examDate: 1 })
      .limit(15)
      .select(
        "examName subjectName examDate startTime totalMarks passingMarks"
      )
      .lean(),

    // ------------------------------------------
    // Recent homework
    // ------------------------------------------

    Homework.find({
      className: student.className,
      section: student.section,
      isActive: true,
    })
      .sort({ assignedDate: -1 })
      .limit(15)
      .select(
        "title subjectName assignedDate dueDate"
      )
      .lean(),

    // ------------------------------------------
    // Timetable
    // ------------------------------------------

    Timetable.find({
      className: student.className,
      section: student.section,
      isActive: true,
    })
      .select(
        "day subjectName teacherName startTime endTime roomNumber"
      )
      .lean(),

    // ------------------------------------------
    // ALL-TIME attendance aggregate
    // ------------------------------------------

    Attendance.aggregate([
      {
        $match: {
          studentId: student._id,
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // ------------------------------------------
    // ALL fee aggregate
    // ------------------------------------------

    Fee.aggregate([
      {
        $match: {
          studentId: student._id,
        },
      },
      {
        $group: {
          _id: null,

          totalAmount: {
            $sum: {
              $ifNull: [
                "$amount",
                0,
              ],
            },
          },

          totalPaid: {
            $sum: {
              $ifNull: [
                "$paidAmount",
                0,
              ],
            },
          },

          totalDue: {
            $sum: {
              $ifNull: [
                "$dueAmount",
                0,
              ],
            },
          },

          recordCount: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  // ====================================================
  // ATTENDANCE AGGREGATE
  // ====================================================

  const attendanceStats = {
    totalRecords: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    attendancePercentage: null,
  };

  attendanceAggregate.forEach(
    (item) => {
      const status = item._id;

      if (
        attendanceStats[status] !==
        undefined
      ) {
        attendanceStats[status] =
          item.count;

        attendanceStats.totalRecords +=
          item.count;
      }
    }
  );

  attendanceStats.attendancePercentage =
    calculatePercentage(
      attendanceStats.present,
      attendanceStats.totalRecords
    );

  // ====================================================
  // FEE AGGREGATE
  // ====================================================

  const feeSummary =
    feeAggregate[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      recordCount: 0,
    };

  return {
    student: {
      id: student._id,
      name: student.name,
      className:
        student.className,
      section:
        student.section,
      rollNumber:
        student.rollNumber,
    },

    dataScope: {
      attendanceStatistics:
        "Calculated from all attendance records available for this student.",

      recentAttendance:
        "Maximum 30 latest attendance records.",

      results:
        "Maximum 15 latest result records.",

      fees:
        "Fee totals are calculated from all fee records. Detailed fee records contain maximum 15 latest records.",

      exams:
        "Maximum 15 active exam records for the student's class and section.",

      homework:
        "Maximum 15 latest active homework records.",

      timetable:
        "Current active timetable records.",
    },

    attendance: {
      statistics:
        attendanceStats,

      recentRecords:
        recentAttendance,
    },

    results:
      recentResults,

    fees: {
      summary: {
        totalAmount:
          Number(
            feeSummary.totalAmount
          ) || 0,

        totalPaid:
          Number(
            feeSummary.totalPaid
          ) || 0,

        pendingAmount:
          Number(
            feeSummary.totalDue
          ) || 0,

        totalRecords:
          feeSummary.recordCount || 0,
      },

      recentRecords:
        recentFees,
    },

    exams,
    homework,
    timetable,
  };
};

// ======================================================
// MAIN ROLE-AWARE CONTEXT BUILDER
// ======================================================

const buildSchoolAIContext = async ({
  userId,
  role,
}) => {
  // ====================================================
  // AUTHENTICATED USER
  // ====================================================

  const user =
    await User.findById(userId)
      .select(
        "_id name email role isActive"
      )
      .lean();

  if (
    !user ||
    !user.isActive
  ) {
    throw new Error(
      "Authenticated user not found"
    );
  }
  
  

  /*
   * Do not blindly trust the role passed to
   * this service if the database says otherwise.
   */

  if (user.role !== role) {
    throw new Error(
      "User role authorization mismatch"
    );
  }

  // ====================================================
  // STUDENT
  // ====================================================

  if (role === "student") {
    const student =
      await Student.findOne({
        email:
          user.email.toLowerCase(),

        isActive: true,
      }).lean();

    if (!student) {
      throw new Error(
        "Student profile not found"
      );
    }

    return {
      role: "student",

      accessRules: {
        scope: "self",

        description:
          "Only this student's own school data may be discussed. Never disclose another student's data.",
      },

      data:
        await getStudentSummary(
          student
        ),
    };
  }

  // ====================================================
  // PARENT
  // ====================================================

	  if (role === "parent") {
	  // ========================================
	  // FIND ACTIVE PARENT PROFILE
	  // ========================================

	  const parent =
		await Parent.findOne({
		  email:
			user.email.toLowerCase(),
		  isActive: true,
		})
		  .select(
			"_id name email studentId isActive"
		  )
		  .lean();

	  if (!parent) {
		throw new Error(
		  "Parent profile not found"
		);
	  }

	  // ========================================
	  // REQUIRE LINKED STUDENT
	  // ========================================

	  if (!parent.studentId) {
		throw new Error(
		  "No student is linked with this parent account"
		);
	  }

	  // ========================================
	  // FETCH LINKED ACTIVE STUDENT DIRECTLY
	  // ========================================

	  const linkedStudent =
		await Student.findOne({
		  _id: parent.studentId,
		  isActive: true,
		})
		  .select(
			"_id name className section rollNumber isActive"
		  )
		  .lean();

	  /*
		Never provide archived/inactive student
		data to the AI merely because an active
		Parent document still contains studentId.
	  */

	  if (!linkedStudent) {
		throw new Error(
		  "Linked student account is inactive or unavailable"
		);
	  }

	  // ========================================
	  // BUILD CHILD-ONLY CONTEXT
	  // ========================================

	  return {
		role: "parent",

		accessRules: {
		  scope:
			"linked-child",

		  description:
			"Only the active linked child's school data may be discussed.",
		},

		data:
		  await getStudentSummary(
			linkedStudent
		  ),
	  };
	}

  // ====================================================
  // TEACHER
  // ====================================================

  if (role === "teacher") {
    const teacher =
      await Teacher.findOne({
        email:
          user.email.toLowerCase(),

        isActive: true,
      })
        .select(
          "_id name subject qualification"
        )
        .lean();

    if (!teacher) {
      throw new Error(
        "Teacher profile not found"
      );
    }

    // --------------------------------------------------
    // Teacher assignments
    // --------------------------------------------------

    const [
      assignedClasses,
      assignedSubjects,
    ] = await Promise.all([
      Class.find({
        classTeacher:
          teacher.name,

        isActive: true,
      })
        .select(
          "_id className section roomNumber"
        )
        .lean(),

      Subject.find({
        teacherName:
          teacher.name,

        isActive: true,
      })
        .select(
          "_id subjectName subjectCode className"
        )
        .lean(),
    ]);

    // --------------------------------------------------
    // Build authorized student conditions
    // --------------------------------------------------

    const classConditions =
      assignedClasses.map(
        (item) => ({
          className:
            item.className,

          section:
            item.section,
        })
      );

    /*
     * Current Subject schema does not contain
     * section.
     *
     * Therefore subject-teacher authorization
     * is className-level until the schema is
     * migrated to teacherId/classId/subjectId/
     * section references.
     */


    const subjectClassNames = [
      ...new Set(
        assignedSubjects
          .map(
            (item) =>
              item.className
          )
          .filter(Boolean)
      ),
    ];

    // ==========================================
// CLASS-TEACHER STUDENTS
// Exact class + section only
// ==========================================

let classTeacherStudents = [];

if (classConditions.length > 0) {
  classTeacherStudents =
    await Student.find({
      isActive: true,
      $or: classConditions,
    })
      .select(
        "_id name className section rollNumber"
      )
      .limit(300)
      .lean();
}

/*
  Important:

  Subject assignments currently contain
  className but no section.

  Therefore we do NOT expose a generic
  student roster merely because a teacher
  teaches a subject in that class.

  Subject-teacher academic access will be
  constructed separately through the
  authorized subject/result conditions.
*/

const students =
  classTeacherStudents;

const classTeacherStudentIds =
  classTeacherStudents.map(
    (student) =>
      student._id
  );

// ==========================================
// ATTENDANCE
// CLASS TEACHER ONLY
// ==========================================

let attendance = [];

if (
  classTeacherStudentIds.length >
  0
) {
  attendance =
    await Attendance.find({
      studentId: {
        $in:
          classTeacherStudentIds,
      },
    })
      .sort({
        date: -1,
      })
      .limit(500)
      .select(
        "studentId studentName className section date status"
      )
      .lean();	  
	}    

    // ==========================================
	// ATTENDANCE STATISTICS
	// ==========================================

	const attendanceStats =
	  buildAttendanceStats(
		attendance
	  );
     
	 // --------------------------------------------------
    // Result authorization
    // --------------------------------------------------

    

    const resultConditions = [];

    if (
      classTeacherStudentIds.length >
      0
    ) {
      resultConditions.push({
        studentId: {
          $in:
            classTeacherStudentIds,
        },
      });
    }

    for (
  const subject
  of assignedSubjects
) {
  /*
    Subject model currently has no section.

    Fetch only the IDs needed to construct
    the authorized result query. These
    student records are NOT exposed as the
    generic teacher student roster.
  */

  const subjectStudents =
    await Student.find({
      className:
        subject.className,
      isActive: true,
    })
      .select("_id")
      .lean();

  const subjectStudentIds =
    subjectStudents.map(
      (student) =>
        student._id
    );

  if (
    subjectStudentIds.length >
    0
  ) {
    resultConditions.push({
      studentId: {
        $in:
          subjectStudentIds,
      },

      subjectName:
        subject.subjectName,
    });
  }
}

    let results = [];

    if (
      resultConditions.length > 0
    ) {
      results =
        await Result.find({
          $or:
            resultConditions,
        })
          .sort({
            createdAt: -1,
          })
          .limit(100)
          .select(
            "studentId studentName examName subjectName totalMarks obtainedMarks percentage grade"
          )
          .lean();
    }

    // --------------------------------------------------
    // Homework authorization
    // --------------------------------------------------

    const homeworkConditions = [];

    assignedClasses.forEach(
      (assignedClass) => {
        homeworkConditions.push({
          className:
            assignedClass.className,

          section:
            assignedClass.section,
        });
      }
    );

    assignedSubjects.forEach(
      (subject) => {
        homeworkConditions.push({
          className:
            subject.className,

          subjectName:
            subject.subjectName,
        });
      }
    );

    let homework = [];

    if (
      homeworkConditions.length >
      0
    ) {
      homework =
        await Homework.find({
          isActive: true,

          $or:
            homeworkConditions,
        })
          .sort({
            assignedDate: -1,
          })
          .limit(50)
          .select(
            "title className section subjectName assignedDate dueDate"
          )
          .lean();
    }

    return {
      role: "teacher",

      accessRules: {
        scope:
          "assigned-classes-and-subjects",

        description:
          "Only data belonging to this teacher's assigned classes or subjects may be discussed. Never disclose data outside these assignments.",
      },

      dataScope: {
        students:
          "Maximum 150 authorized active student records.",

        attendance:
          "Statistics and recent records are based on maximum 150 latest authorized attendance records.",

        results:
          "Maximum 100 latest authorized result records.",

        homework:
          "Maximum 50 latest authorized homework records.",

        important:
          "Limited record sets must not be described as complete historical school data.",
      },

      data: {
        teacher: {
          name:
            teacher.name,

          subject:
            teacher.subject ||
            "",
        },

        assignments: {
          classes:
            assignedClasses.map(
              (item) => ({
                className:
                  item.className,

                section:
                  item.section,
              })
            ),

          subjects:
            assignedSubjects.map(
              (item) => ({
                subjectName:
                  item.subjectName,

                subjectCode:
                  item.subjectCode,

                className:
                  item.className,
              })
            ),
        },

        students,

        attendance: {
          statistics:
            attendanceStats,

          recentRecords:
            attendance,
        },

        results,
        homework,
      },
    };
  }

  // ====================================================
  // ADMIN
  // ====================================================

  if (role === "admin") {
    /*
     * Admin does NOT need hundreds of full raw
     * student records for every normal AI question.
     *
     * We provide aggregate school statistics plus
     * small recent samples.
     */

    const [
      totalStudents,

      attendanceAggregate,

      resultAggregate,

      feeAggregate,

      recentAttendance,

      recentResults,

      recentFees,
    ] = await Promise.all([
      // ------------------------------------------
      // Student count
      // ------------------------------------------

      Student.countDocuments({
        isActive: true,
      }),

      // ------------------------------------------
      // Attendance aggregate
      // ------------------------------------------

      Attendance.aggregate([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      // ------------------------------------------
      // Result aggregate
      // ------------------------------------------

      Result.aggregate([
        {
          $group: {
            _id: null,

            averagePercentage: {
              $avg:
                "$percentage",
            },

            totalResults: {
              $sum: 1,
            },

            highestPercentage: {
              $max:
                "$percentage",
            },

            lowestPercentage: {
              $min:
                "$percentage",
            },
          },
        },
      ]),

      // ------------------------------------------
      // Fee aggregate
      // ------------------------------------------

      Fee.aggregate([
        {
          $group: {
            _id: null,

            totalAmount: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },

            totalPaid: {
              $sum: {
                $ifNull: [
                  "$paidAmount",
                  0,
                ],
              },
            },

            totalDue: {
              $sum: {
                $ifNull: [
                  "$dueAmount",
                  0,
                ],
              },
            },

            totalRecords: {
              $sum: 1,
            },
          },
        },
      ]),

      // ------------------------------------------
      // Small recent samples
      // ------------------------------------------

      Attendance.find({})
        .sort({ date: -1 })
        .limit(50)
        .select(
          "studentName className section date status"
        )
        .lean(),

      Result.find({})
        .sort({
          createdAt: -1,
        })
        .limit(40)
        .select(
          "studentName examName subjectName percentage grade"
        )
        .lean(),

      Fee.find({})
        .sort({
          createdAt: -1,
        })
        .limit(40)
        .select(
          "studentName className section amount paidAmount dueAmount status dueDate"
        )
        .lean(),
    ]);

    // --------------------------------------------------
    // Attendance statistics
    // --------------------------------------------------

    const attendanceStats = {
      totalRecords: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      attendancePercentage:
        null,
    };

    attendanceAggregate.forEach(
      (item) => {
        const status =
          item._id;

        if (
          attendanceStats[
            status
          ] !== undefined
        ) {
          attendanceStats[
            status
          ] =
            item.count;

          attendanceStats.totalRecords +=
            item.count;
        }
      }
    );

    attendanceStats.attendancePercentage =
      calculatePercentage(
        attendanceStats.present,
        attendanceStats.totalRecords
      );

    // --------------------------------------------------
    // Academic statistics
    // --------------------------------------------------

    const academic =
      resultAggregate[0] || {
        averagePercentage: null,
        totalResults: 0,
        highestPercentage: null,
        lowestPercentage: null,
      };

    // --------------------------------------------------
    // Fee statistics
    // --------------------------------------------------

    const fee =
      feeAggregate[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        totalRecords: 0,
      };

    return {
      role: "admin",

      accessRules: {
        scope:
          "school-management",

        description:
          "School-wide operational and academic data may be summarized for the administrator. Do not infer private or sensitive facts that are not explicitly present.",
      },

      dataScope: {
        aggregates:
          "School-wide aggregate values are calculated from the available database records.",

        recentAttendance:
          "Maximum 50 latest attendance records are included as supporting context.",

        recentResults:
          "Maximum 40 latest result records are included as supporting context.",

        recentFees:
          "Maximum 40 latest fee records are included as supporting context.",

        important:
          "Recent samples must not be described as the complete historical record.",
      },

      data: {
        schoolSummary: {
          totalActiveStudents:
            totalStudents,

          attendance:
            attendanceStats,

          academicPerformance: {
            totalResults:
              academic.totalResults ||
              0,

            averagePercentage:
              academic.averagePercentage !=
              null
                ? Number(
                    Number(
                      academic.averagePercentage
                    ).toFixed(2)
                  )
                : null,

            highestPercentage:
              academic.highestPercentage ??
              null,

            lowestPercentage:
              academic.lowestPercentage ??
              null,
          },

          fees: {
            totalRecords:
              fee.totalRecords ||
              0,

            totalAmount:
              Number(
                fee.totalAmount
              ) || 0,

            totalPaid:
              Number(
                fee.totalPaid
              ) || 0,

            totalDue:
              Number(
                fee.totalDue
              ) || 0,
          },
        },

        recentAttendance,
        recentResults,
        recentFees,
      },
    };
  }

  // ====================================================
  // UNSUPPORTED ROLE
  // ====================================================

  throw new Error(
    "Unsupported user role"
  );
};

module.exports = {
  buildSchoolAIContext,
};