const rateLimit = require(
  "express-rate-limit"
);

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 500,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message:
      "Too many requests. Please wait and try again.",
  },

  handler: (req, res, next, options) => {
    return res
      .status(options.statusCode)
      .json(options.message);
  },
});

module.exports = globalRateLimiter;