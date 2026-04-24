const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const urlRoutes = require("./routes/urlRoutes");
const healthRoutes = require("./routes/healthRoutes");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const { redirectToUrl } = require("./controllers/urlController");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Request logging
app.use(morgan("combined"));

// Body parser
app.use(express.json({ limit: "10kb" }));

// Rate limiting
app.use("/api/", rateLimiter);

// Routes
app.use("/health", healthRoutes);
app.use("/api/urls", urlRoutes);

// Redirect route — must be last before error handler
app.get("/:slug", redirectToUrl);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
