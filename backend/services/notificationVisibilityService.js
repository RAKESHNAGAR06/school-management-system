const Student = require("../models/Student");
const Parent = require("../models/Parent");

const buildNotificationVisibility = async (user) => {
  const conditions = [
    { targetType: "all" },

    {
      targetType: "role",
      targetRoles: user.role,
    },

    {
      targetType: "user",
      targetUsers: user._id,
    },
  ];

  // Student class notifications
  if (user.role === "student") {
    const student = await Student.findOne({
      email: user.email.toLowerCase(),
      isActive: true,
    });

    if (student) {
      conditions.push({
        targetType: "class",
        className: student.className,
        $or: [
          { section: student.section },
          { section: "" },
        ],
      });
    }
  }

  // Parent receives child's class notifications
  if (user.role === "parent") {
    const parent = await Parent.findOne({
      email: user.email.toLowerCase(),
      isActive: true,
    }).populate("studentId");

    if (parent?.studentId) {
      conditions.push({
        targetType: "class",
        className: parent.studentId.className,
        $or: [
          { section: parent.studentId.section },
          { section: "" },
        ],
      });
    }
  }

  return conditions;
};

module.exports = {
  buildNotificationVisibility,
};