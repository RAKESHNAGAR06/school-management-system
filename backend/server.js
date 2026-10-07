const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const multer = require("multer");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const classRoutes = require("./routes/classRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingRoutes = require("./routes/settingRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const aiRoutes = require("./routes/aiRoutes");
const helmet = require("helmet");

const globalRateLimiter = require(
  "./middleware/globalRateLimiter"
);

const whatsappWebhookRoutes = require(
  "./routes/whatsappWebhookRoutes"
);




// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

const requiredEnvironmentVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
];

const missingEnvironmentVariables =
  requiredEnvironmentVariables.filter(
    (variableName) =>
      !process.env[variableName] ||
      !process.env[
        variableName
      ].trim()
  );

if (
  missingEnvironmentVariables.length >
  0
) {
  console.error(
    `FATAL ERROR: Missing required environment variables: ${missingEnvironmentVariables.join(
      ", "
    )}`
  );

  process.exit(1);
}

// ==========================================
// PRODUCTION SECURITY VALIDATION
// ==========================================

if (
  process.env.NODE_ENV ===
    "production" &&
  process.env.JWT_SECRET.length < 32
) {
  console.error(
    "FATAL ERROR: JWT_SECRET must be at least 32 characters in production."
  );

  process.exit(1);
}

if (
  process.env.NODE_ENV ===
    "production" &&
  !process.env.TZ
) {
  console.error(
    "FATAL ERROR: TZ is required in production."
  );

  process.exit(1);
}

const {
  verifyEmailConnection,
} = require("./services/emailService");

const app = express();

if (
  process.env.NODE_ENV ===
  "production"
) {
  app.set("trust proxy", 1);
}
// ==========================================
// BASIC EXPRESS SECURITY
// ==========================================

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);





// ==========================================
// CORS
// ==========================================

const allowedOrigins = (
  process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      // Allow non-browser requests
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Origin not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// ==========================================
// UPLOAD ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    if (
      err instanceof
      multer.MulterError
    ) {
      if (
        err.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Logo image must be 2 MB or smaller.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid image upload.",
        });
    }

    next(err);
  }
);


app.use(
  express.json({
    limit: "1mb",

    verify: (
      req,
      res,
      buffer
    ) => {
      /*
        Meta webhook signature verification
        requires the exact raw request bytes.

        Store raw body only for WhatsApp
        webhook requests so normal API
        requests do not keep unnecessary
        duplicate request data.
      */

      if (
        req.originalUrl
          .split("?")[0]
          .startsWith(
            "/api/whatsapp/webhook"
          )
      ) {
        req.rawBody =
          Buffer.from(buffer);
      }
    },
  })
);

app.use("/api", globalRateLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ai", aiRoutes);


app.use(
  "/api/whatsapp/webhook",
  whatsappWebhookRoutes
);


// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Management System API is running",
  });
});

// ==========================================
// CORS ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  if (
    err?.message ===
    "Origin not allowed by CORS"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Request origin is not allowed.",
    });
  }

  next(err);
});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error(
    "Unhandled server error:",
    err
  );

  return res.status(
    err.status || 500
  ).json({
    success: false,

    message:
      process.env.NODE_ENV ===
      "production"
        ? "Something went wrong on the server."
        : err.message ||
          "Something went wrong on the server.",
  });
});

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ==========================================
    // CONNECT DATABASE FIRST
    // ==========================================

    await connectDB();

    // ==========================================
    // VERIFY OPTIONAL EMAIL SERVICE
    // ==========================================

    try {
      await verifyEmailConnection();
    } catch (error) {
      console.error(
        "Email server connection failed"
      );
    }

    // ==========================================
    // START EXPRESS SERVER
    // ==========================================

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server: MongoDB connection failed"
    );

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.error(
        error.message
      );
    }

    process.exit(1);
  }
};

startServer();