const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/index");
const passport = require("./config/passport");

const app = express();

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security headers — protects against XSS, clickjacking, etc.
app.use(helmet());

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login attempts per 15 mins
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  },
});

if (process.env.NODE_ENV !== 'test') {
  app.use(globalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
}

app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:5173",
      "http://localhost:5173",
      "https://make-authority.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api", routes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Boostr API is running." });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

module.exports = app;