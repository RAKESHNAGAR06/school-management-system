const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");

// Get Reports Summary
const getReportSummary = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      totalExams,
      totalResults,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Parent.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Exam.countDocuments(),
      Result.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        totalSubjects,
        totalExams,
        totalResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const {
      className,
      section,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        filter.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const attendanceRecords = await Attendance.find(filter);

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    attendanceRecords.forEach((record) => {
      if (record.status === "present") present++;
      else if (record.status === "absent") absent++;
      else if (record.status === "late") late++;
      else if (record.status === "leave") leave++;
    });

    const total = attendanceRecords.length;

    const attendancePercentage =
      total > 0
        ? ((present + late) / total) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRecords: total,
        present,
        absent,
        late,
        leave,
        attendancePercentage: Number(
          attendancePercentage.toFixed(2)
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFeesReport = async (req, res) => {
  try {
    const {
      className,
      section,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (startDate || endDate) {
      filter.dueDate = {};

      if (startDate) {
        filter.dueDate.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        filter.dueDate.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    const fees = await Fee.find(filter);

    let totalFees = 0;
    let collectedFees = 0;
    let pendingFees = 0;

    fees.forEach((fee) => {
      const totalAmount = Number(fee.amount) || 0;
      const paidAmount = Number(fee.paidAmount) || 0;

      totalFees += totalAmount;
      collectedFees += paidAmount;
      pendingFees += Math.max(
        totalAmount - paidAmount,
        0
      );
    });

    const collectionPercentage =
      totalFees > 0
        ? (collectedFees / totalFees) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalFees: Number(totalFees.toFixed(2)),
        collectedFees: Number(
          collectedFees.toFixed(2)
        ),
        pendingFees: Number(
          pendingFees.toFixed(2)
        ),
        collectionPercentage: Number(
          collectionPercentage.toFixed(2)
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPerformanceReport = async (req, res) => {
  try {
    const {
      className,
      section,
      startDate,
      endDate,
    } = req.query;

    const resultFilter = {};

    if (className || section) {
      const studentFilter = {};

      if (className) {
        studentFilter.className = className;
      }

      if (section) {
        studentFilter.section = section;
      }

      const students = await Student.find(
        studentFilter
      ).select("_id");

      resultFilter.studentId = {
        $in: students.map((student) => student._id),
      };
    }

    if (startDate || endDate) {
      resultFilter.createdAt = {};

      if (startDate) {
        resultFilter.createdAt.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        resultFilter.createdAt.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    const results = await Result.find(resultFilter);

    const totalResults = results.length;

    const grades = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    if (totalResults === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalResults: 0,
          averagePercentage: 0,
          highestPercentage: 0,
          lowestPercentage: 0,
          passedStudents: 0,
          failedStudents: 0,
          grades,
        },
      });
    }

    let totalPercentage = 0;
    let highestPercentage = 0;
    let lowestPercentage = 100;
    let passedStudents = 0;
    let failedStudents = 0;

    results.forEach((result) => {
      const percentage =
        Number(result.percentage) || 0;

      totalPercentage += percentage;

      if (percentage > highestPercentage) {
        highestPercentage = percentage;
      }

      if (percentage < lowestPercentage) {
        lowestPercentage = percentage;
      }

      if (percentage >= 40) {
        passedStudents++;
      } else {
        failedStudents++;
      }

      if (grades[result.grade] !== undefined) {
        grades[result.grade]++;
      }
    });

    const averagePercentage =
      totalPercentage / totalResults;

    res.status(200).json({
      success: true,
      data: {
        totalResults,
        averagePercentage: Number(
          averagePercentage.toFixed(2)
        ),
        highestPercentage: Number(
          highestPercentage.toFixed(2)
        ),
        lowestPercentage: Number(
          lowestPercentage.toFixed(2)
        ),
        passedStudents,
        failedStudents,
        grades,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const exportResultsCSV = async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });

    const headers = [
      "Student Name",
      "Exam Name",
      "Subject",
      "Total Marks",
      "Obtained Marks",
      "Percentage",
      "Grade",
      "Remarks",
    ];

    const rows = results.map((result) => [
      result.studentName,
      result.examName,
      result.subjectName,
      result.totalMarks,
      result.obtainedMarks,
      result.percentage,
      result.grade,
      result.remarks || "",
    ]);

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="results-report.csv"'
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const exportAttendanceCSV = async (req, res) => {
  try {
    const filter = buildBasicFilter(req.query, "date");

		const attendanceRecords = await Attendance.find(filter).sort({
		  date: -1,
		});

    const headers = [
      "Student Name",
      "Date",
      "Class",
      "Section",
      "Status",
    ];

    const rows = attendanceRecords.map((record) => [
      record.studentName,
      record.date,
      record.className,
      record.section,
      record.status,
    ]);

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="attendance-report.csv"'
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const exportFeesCSV = async (req, res) => {
  try {
    const filter = buildBasicFilter(req.query, "dueDate");

		const fees = await Fee.find(filter).sort({
		  createdAt: -1,
		});

    const headers = [
      "Student Name",
      "Fee Type",
      "Total Amount",
      "Paid Amount",
      "Pending Amount",
      "Payment Status",
      "Payment Date",
    ];

    const rows = fees.map((fee) => {
      const totalAmount = Number(fee.amount || 0);
      const paidAmount = Number(fee.paidAmount || 0);
      const pendingAmount = Math.max(totalAmount - paidAmount, 0);

      return [
        fee.studentName,
        fee.feeType,
        totalAmount,
        paidAmount,
        pendingAmount,
        fee.status,
        fee.paymentDate,
      ];
    });

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="fees-report.csv"'
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const exportPerformanceCSV = async (req, res) => {
  try {
    const {
  className,
  section,
  startDate,
  endDate,
} = req.query;

const filter = {};

if (className || section) {
  const studentFilter = {};

  if (className) {
    studentFilter.className = className;
  }

  if (section) {
    studentFilter.section = section;
  }

  const students = await Student.find(
    studentFilter
  ).select("_id");

  filter.studentId = {
    $in: students.map((student) => student._id),
  };
}

if (startDate || endDate) {
  filter.createdAt = {};

  if (startDate) {
    filter.createdAt.$gte = new Date(
      `${startDate}T00:00:00.000Z`
    );
  }

  if (endDate) {
    filter.createdAt.$lte = new Date(
      `${endDate}T23:59:59.999Z`
    );
  }
}

const results = await Result.find(filter).sort({
  createdAt: -1,
});

    const headers = [
      "Student Name",
      "Exam Name",
      "Subject",
      "Total Marks",
      "Obtained Marks",
      "Percentage",
      "Grade",
      "Remarks",
    ];

    const rows = results.map((result) => [
      result.studentName,
      result.examName,
      result.subjectName,
      result.totalMarks,
      result.obtainedMarks,
      result.percentage,
      result.grade,
      result.remarks,
    ]);

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="performance-report.csv"'
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getStudentWiseReport = async (req, res) => {
  try {
    const {
      className,
      section,
      startDate,
      endDate,
    } = req.query;

    // Student filter
    const studentFilter = {
      isActive: true,
    };

    if (className) {
      studentFilter.className = className;
    }

    if (section) {
      studentFilter.section = section;
    }

    const students = await Student.find(studentFilter)
      .sort({
        className: 1,
        section: 1,
        rollNumber: 1,
        name: 1,
      });

    const studentIds = students.map(
      (student) => student._id
    );

    // Attendance filter
    const attendanceFilter = {
      studentId: { $in: studentIds },
    };

    if (startDate || endDate) {
      attendanceFilter.date = {};

      if (startDate) {
        attendanceFilter.date.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        attendanceFilter.date.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    // Fee filter
    const feeFilter = {
      studentId: { $in: studentIds },
    };

    if (startDate || endDate) {
      feeFilter.dueDate = {};

      if (startDate) {
        feeFilter.dueDate.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        feeFilter.dueDate.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    // Result filter
    const resultFilter = {
      studentId: { $in: studentIds },
    };

    if (startDate || endDate) {
      resultFilter.createdAt = {};

      if (startDate) {
        resultFilter.createdAt.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        resultFilter.createdAt.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    const [
      attendanceRecords,
      fees,
      results,
    ] = await Promise.all([
      Attendance.find(attendanceFilter),
      Fee.find(feeFilter),
      Result.find(resultFilter),
    ]);

    const report = students.map((student) => {
      const studentId = student._id.toString();

      // -----------------------
      // Attendance
      // -----------------------
      const studentAttendance =
        attendanceRecords.filter(
          (record) =>
            record.studentId?.toString() === studentId
        );

      const totalAttendance =
        studentAttendance.length;

      const presentCount =
        studentAttendance.filter(
          (record) =>
            record.status === "present"
        ).length;

      const lateCount =
        studentAttendance.filter(
          (record) =>
            record.status === "late"
        ).length;

      const attendancePercentage =
        totalAttendance > 0
          ? ((presentCount + lateCount) /
              totalAttendance) *
            100
          : 0;

      // -----------------------
      // Fees
      // -----------------------
      const studentFees = fees.filter(
        (fee) =>
          fee.studentId?.toString() === studentId
      );

      let totalFees = 0;
      let paidFees = 0;

      studentFees.forEach((fee) => {
        totalFees += Number(fee.amount) || 0;
        paidFees += Number(fee.paidAmount) || 0;
      });

      const pendingFees = Math.max(
        totalFees - paidFees,
        0
      );

      // -----------------------
      // Results
      // -----------------------
      const studentResults = results.filter(
        (result) =>
          result.studentId?.toString() === studentId
      );

      const averagePercentage =
        studentResults.length > 0
          ? studentResults.reduce(
              (sum, result) =>
                sum +
                (Number(result.percentage) || 0),
              0
            ) / studentResults.length
          : 0;

      let performanceStatus = "No Result";

      if (studentResults.length > 0) {
        if (averagePercentage >= 75) {
          performanceStatus = "Excellent";
        } else if (averagePercentage >= 60) {
          performanceStatus = "Good";
        } else if (averagePercentage >= 40) {
          performanceStatus = "Average";
        } else {
          performanceStatus = "Needs Improvement";
        }
      }

      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber || "",
        className: student.className || "",
        section: student.section || "",

        attendance: {
          totalRecords: totalAttendance,
          percentage: Number(
            attendancePercentage.toFixed(2)
          ),
        },

        fees: {
          total: Number(totalFees.toFixed(2)),
          paid: Number(paidFees.toFixed(2)),
          pending: Number(
            pendingFees.toFixed(2)
          ),
        },

        performance: {
          totalResults: studentResults.length,
          averagePercentage: Number(
            averagePercentage.toFixed(2)
          ),
          status: performanceStatus,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReportSummary,
  getAttendanceReport,
  getFeesReport,
  getPerformanceReport,
  exportResultsCSV,
  exportAttendanceCSV,
  exportFeesCSV,
  exportPerformanceCSV,
  getStudentWiseReport,
};



const buildBasicFilter = (query, dateField) => {
  const {
    className,
    section,
    startDate,
    endDate,
  } = query;

  const filter = {};

  if (className) filter.className = className;
  if (section) filter.section = section;

  if (startDate || endDate) {
    filter[dateField] = {};

    if (startDate) {
      filter[dateField].$gte = new Date(
        `${startDate}T00:00:00.000Z`
      );
    }

    if (endDate) {
      filter[dateField].$lte = new Date(
        `${endDate}T23:59:59.999Z`
      );
    }
  }

  return filter;
};