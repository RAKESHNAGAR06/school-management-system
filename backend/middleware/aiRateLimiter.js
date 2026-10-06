const rateLimit = require("express-rate-limit");

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,

  limit: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many AI requests. Please wait a minute and try again.",
  },
});

module.exports = aiRateLimiter;