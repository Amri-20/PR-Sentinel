import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import userRouter from "./routes/user.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();
const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      // Requests made through Vite's proxy have no Origin header, while browser
      // requests must come from an explicitly configured frontend.
      if (!origin || frontendOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Request parsing
app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

// Static files
app.use(express.static("public"));

// Cookie parser
app.use(cookieParser());

// HTTP request logging
app.use(morgan("dev"));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PR Sentinel API is running",
  });
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api/v1", apiLimiter);

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/github", githubRoutes);
app.use("/api/v1/repositories", repositoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const candidateStatus = err.statusCode ?? err.status;

  const statusCode =
    Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 &&
    candidateStatus <= 599
      ? candidateStatus
      : 500;

  console.error(err);

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message || "Request failed",
    errors: err.errors || [],
  });
});

// app.use(cookieParser());

export { app };
