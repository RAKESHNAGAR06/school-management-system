const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateTemporaryPassword =
  require("../utils/generateTemporaryPassword");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const validatePassword = require("../utils/validatePassword");

const {
  sendLoginCredentials,
} = require("../services/credentialDeliveryService");

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
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

    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User already exists",
      });
    }

    // ========================================
    // PUBLIC REGISTRATION SECURITY
    // ========================================

    /*
      IMPORTANT:

      Public registration must NEVER accept
      admin / teacher / parent role from
      req.body.

      Teacher, Parent and managed Student
      accounts are created by Admin modules.

      Public registration is restricted to
      Student role only.
    */

    const user =
      await User.create({
        name: cleanName,
        email: normalizedEmail,
        password,
        role: "student",
        phone: cleanPhone,
        isActive: true,
        mustChangePassword: false,
      });

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword:
          user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to register user",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ==========================================
    // CHECK PASSWORD FIRST
    // ==========================================

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ==========================================
    // CHECK ACCOUNT STATUS
    // ==========================================

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact administrator.",
      });
    }

    // ==========================================
    // CREATE TOKEN
    // ==========================================

   const token = jwt.sign(
	  {
		userId: user._id.toString(),
		role: user.role,
		tokenVersion:
		  user.tokenVersion || 0,
	  },
	  process.env.JWT_SECRET,
	  {
		expiresIn:
		  process.env.JWT_EXPIRES_IN ||
		  "1d",
	  }
	);

    return res.status(200).json({
      success: true,
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        // Frontend ko pata chalega ki
        // temporary password change karna hai.
        mustChangePassword:
          user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login. Please try again.",
    });
  }
};


// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    const passwordValidation =
		validatePassword(newPassword);

	if (!passwordValidation.valid) {
	  return res.status(400).json({
		success: false,
		message:
		  passwordValidation.message,
	  });
	}

    // ==========================================
    // FIND USER WITH PASSWORD
    // ==========================================

    const user = await User.findById(
      req.user.userId
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    // ==========================================
    // CHECK CURRENT PASSWORD
    // ==========================================

    const isCurrentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ==========================================
    // PREVENT SAME PASSWORD
    // ==========================================

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    user.password = newPassword;

	user.mustChangePassword =
	  false;

	user.tokenVersion =
	  (user.tokenVersion || 0) + 1;

	await user.save();
    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
      },
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password",
    });
  }
};


// ==========================================
// ADMIN RESET PROFILE PASSWORD
// ==========================================

const resetUserPassword = async (
  req,
  res
) => {
  try {
    const {
      role,
      profileId,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    const allowedRoles = [
      "student",
      "teacher",
      "parent",
    ];

    if (!role || !profileId) {
      return res.status(400).json({
        success: false,
        message:
          "Role and profile ID are required",
      });
    }

    if (
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role for password reset",
      });
    }

    // ========================================
    // FIND PROFILE
    // ========================================

    let profile = null;

    if (role === "student") {
      profile =
        await Student.findById(
          profileId
        );
    }

    if (role === "teacher") {
      profile =
        await Teacher.findById(
          profileId
        );
    }

    if (role === "parent") {
      profile =
        await Parent.findById(
          profileId
        );
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          `${role} profile not found`,
      });
    }

    // ========================================
    // PROFILE MUST BE ACTIVE
    // ========================================

    if (profile.isActive === false) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot reset password for an inactive ${role}`,
      });
    }

    // ========================================
    // NORMALIZE EMAIL
    // ========================================

    const normalizedEmail =
      String(profile.email || "")
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Profile does not have a valid email",
      });
    }

    // ========================================
    // FIND LINKED LOGIN ACCOUNT
    // ========================================

    let user =
      await User.findOne({
        email: normalizedEmail,
        role,
      }).select("+password");

    let loginAccountCreated = false;

    // ========================================
    // GENERATE TEMPORARY PASSWORD
    // ========================================

    const temporaryPassword =
      generateTemporaryPassword();

    // ========================================
    // OLD PROFILE WITHOUT LOGIN ACCOUNT
    // ========================================

    if (!user) {
      /*
        Before creating a User, check whether
        this email already belongs to another
        role/account.

        User.email is unique, so we must not
        create another account using it.
      */

      const conflictingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (conflictingUser) {
        return res.status(409).json({
          success: false,
          message:
            `This email is already linked to a ${conflictingUser.role} login account`,
        });
      }

      // ======================================
      // CREATE MISSING LOGIN ACCOUNT
      // ======================================

      user =
        await User.create({
          name:
            String(
              profile.name || ""
            ).trim(),

          email:
            normalizedEmail,

          phone:
            String(
              profile.phone || ""
            ).trim(),

          /*
            IMPORTANT:
            Plain temporary password assign
            karna hai.

            User model pre-save hook ise
            automatically hash karega.
          */
          password:
            temporaryPassword,

          role,

          isActive: true,

          mustChangePassword: true,

          tokenVersion: 0,
        });

      loginAccountCreated = true;
    } else {
      // ======================================
      // EXISTING LOGIN ACCOUNT
      // ======================================

      if (user.isActive === false) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot reset password for an inactive account",
        });
      }

      /*
        Keep login account information synced
        with the profile.
      */

      user.name =
        String(
          profile.name ||
          user.name ||
          ""
        ).trim();

      user.phone =
        String(
          profile.phone ||
          user.phone ||
          ""
        ).trim();

      // Plain password.
      // User model hashes on save.
      user.password =
        temporaryPassword;

      user.mustChangePassword = true;

      /*
        Invalidate all existing sessions.

        Any JWT containing the previous
        tokenVersion will stop working.
      */

      user.tokenVersion =
        (user.tokenVersion || 0) + 1;

      await user.save();
    }

    // ========================================
    // SEND CREDENTIALS
    // ========================================

    let credentialDelivery = null;

    try {
      credentialDelivery =
        await sendLoginCredentials({
          name:
            profile.name ||
            user.name,

          email:
            user.email,

          phone:
            profile.phone ||
            user.phone ||
            "",

          role:
            user.role,

          temporaryPassword,
        });
    } catch (deliveryError) {
      /*
        Password reset/account creation should
        remain successful even if Email or
        WhatsApp delivery temporarily fails.

        Admin still receives the temporary
        password in the API response/modal.
      */

      console.error(
        "Credential delivery error:",
        deliveryError
      );

      credentialDelivery = {
        success: false,
        error:
          deliveryError.message,
      };
    }

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        loginAccountCreated
          ? "Login account created and temporary password generated successfully"
          : "Temporary password generated successfully",

      data: {
        profileId:
          profile._id,

        userId:
          user._id,

        name:
          profile.name ||
          user.name,

        email:
          user.email,

        phone:
          profile.phone ||
          user.phone ||
          "",

        role:
          user.role,

        mustChangePassword:
          true,

        loginAccountCreated,
      },

      temporaryPassword,

      credentialDelivery,
    });
  } catch (error) {
    console.error(
      "Reset user password error:",
      error
    );

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid profile ID",
      });
    }

    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A login account already exists with this email",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};

// ==========================================
// LOGOUT FROM ALL DEVICES
// ==========================================

const logoutAllDevices = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "User account is inactive",
      });
    }

    /*
      Incrementing tokenVersion invalidates
      every JWT issued with the previous
      tokenVersion.

      The current token is also intentionally
      invalidated.
    */

    user.tokenVersion =
      (user.tokenVersion || 0) + 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Logged out from all devices successfully.",
    });
  } catch (error) {
    console.error(
      "Logout all devices error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to logout from all devices.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  resetUserPassword,
  logoutAllDevices,
};