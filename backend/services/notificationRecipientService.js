const User = require("../models/User");
const Student = require("../models/Student");
const Parent = require("../models/Parent");

const resolveNotificationRecipients = async (notification) => {
  let users = [];

  // Everyone
  if (notification.targetType === "all") {
    users = await User.find({
      isActive: true,
    }).select("_id name email phone role");
  }

  // Selected roles
  else if (notification.targetType === "role") {
    users = await User.find({
      role: {
        $in: notification.targetRoles,
      },
      isActive: true,
    }).select("_id name email phone role");
  }

  // Selected users
  else if (notification.targetType === "user") {
    users = await User.find({
      _id: {
        $in: notification.targetUsers,
      },
      isActive: true,
    }).select("_id name email phone role");
  }

  // Class / Section
  else if (notification.targetType === "class") {
    const studentFilter = {
      className: notification.className,
      isActive: true,
    };

    if (notification.section) {
      studentFilter.section = notification.section;
    }

    const students = await Student.find(
      studentFilter
    ).select("_id email");

    if (!students.length) {
      return [];
    }

    const studentEmails = students
      .map((student) =>
        student.email?.toLowerCase().trim()
      )
      .filter(Boolean);

    // Student User accounts
    const studentUsers = await User.find({
      role: "student",
      email: {
        $in: studentEmails,
      },
      isActive: true,
    }).select("_id name email phone role");

    /*
      Find parents linked to these students.

      Parent.studentId references Student.
    */
    const studentIds = students.map(
      (student) => student._id
    );

    const parents = await Parent.find({
      studentId: {
        $in: studentIds,
      },
      isActive: true,
    }).select("email");

    const parentEmails = parents
      .map((parent) =>
        parent.email?.toLowerCase().trim()
      )
      .filter(Boolean);

    const parentUsers = parentEmails.length
      ? await User.find({
          role: "parent",
          email: {
            $in: parentEmails,
          },
          isActive: true,
        }).select("_id name email phone role")
      : [];

    users = [...studentUsers, ...parentUsers];
  }

  // Remove duplicate users
  const uniqueUsers = new Map();

  users.forEach((user) => {
    uniqueUsers.set(
      user._id.toString(),
      user
    );
  });

  return Array.from(uniqueUsers.values());
};

module.exports = {
  resolveNotificationRecipients,
};