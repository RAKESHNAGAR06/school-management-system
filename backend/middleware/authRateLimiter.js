const rateLimit = require(
  "express-rate-limit"
);

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    code: "LOGIN_RATE_LIMIT_EXCEEDED",
    message:
      "Too many failed login attempts. Please wait 15 minutes and try again.",
  },

  handler: (req, res, next, options) => {
    return res
      .status(options.statusCode)
      .json(options.message);
  },
});

module.exports = {
  loginRateLimiter,
};