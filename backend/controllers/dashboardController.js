const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Class = require("../models/Class");

// Helper function to calculate percentage change
const calculatePercentageChange = async (Model) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Total current records
  const totalCount = await Model.countDocuments();

  // Records created before this month started (Last month total)
  const lastMonthCount = await Model.countDocuments({
    createdAt: { $lt: startOfThisMonth },
  });

  if (lastMonthCount === 0) {
    return totalCount > 0 ? "+100%" : "0%";
  }

  const diff = totalCount - lastMonthCount;
  const percentage = ((diff / lastMonthCount) * 100).toFixed(1);

  return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      studentChange,
      teacherChange,
      parentChange,
      classChange,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Parent.countDocuments(),
      Class.countDocuments(),
      calculatePercentageChange(Student),
      calculatePercentageChange(Teacher),
      calculatePercentageChange(Parent),
      calculatePercentageChange(Class),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        studentChange,
        teacherChange,
        parentChange,
        classChange,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getDashboardStats };