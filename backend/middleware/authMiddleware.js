const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// PROTECT ROUTE
// ==========================================

const protect = async (req, res, next) => {
  try {
    let token;

    // ========================================
    // GET TOKEN
    // ========================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authorized, token not found",
      });
    }

    // ========================================
    // VERIFY TOKEN
    // ========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================
    // GET CURRENT USER FROM DATABASE
    // ========================================

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account not found",
      });
    }
	
	
	// ========================================
	// CHECK TOKEN VERSION
	// ========================================

	const currentTokenVersion =
	  user.tokenVersion || 0;

	const jwtTokenVersion =
	  decoded.tokenVersion || 0;

	if (
	  jwtTokenVersion !==
	  currentTokenVersion
	) {
	  return res.status(401).json({
		success: false,
		code: "SESSION_INVALIDATED",
		message:
		  "Your session is no longer valid. Please login again.",
	  });
	}

    // ========================================
    // CHECK ACTIVE ACCOUNT
    // ========================================

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact administrator.",
      });
    }

    // ========================================
    // SET CURRENT DATABASE USER
    // ========================================

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      mustChangePassword:
        user.mustChangePassword === true,
    };

    // ========================================
    // FORCE PASSWORD CHANGE
    // ========================================

    /*
      IMPORTANT:

      /api/auth/change-password must remain
      accessible, otherwise temporary-password
      users could never change their password.
    */

    const isChangePasswordRoute =
      req.originalUrl
        .split("?")[0]
        .endsWith(
          "/auth/change-password"
        );

    if (
      user.mustChangePassword === true &&
      !isChangePasswordRoute
    ) {
      return res.status(403).json({
        success: false,

        code:
          "PASSWORD_CHANGE_REQUIRED",

        message:
          "You must change your temporary password before continuing.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    if (
      error.name ===
        "JsonWebTokenError" ||
      error.name ===
        "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not authorized, invalid or expired token",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Not authorized",
    });
  }
};

// ==========================================
// ADMIN ONLY
// ==========================================

const adminOnly = (
  req,
  res,
  next
) => {
  if (
    req.user &&
    req.user.role === "admin"
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message:
      "Access denied. Admin only.",
  });
};

// ==========================================
// AUTHORIZE ROLES
// ==========================================

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  adminOnly,
  authorizeRoles,
};