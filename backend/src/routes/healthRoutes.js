const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const redis = require("../config/redis");

// GET /health — used by CI pipeline for blue-green switch decision
router.get("/", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "up" : "down";

  let redisStatus = "down";
  try {
    await redis.ping();
    redisStatus = "up";
  } catch {
    redisStatus = "down";
  }

  const healthy = mongoStatus === "up" && redisStatus === "up";

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "unhealthy",
    version: process.env.APP_VERSION || "v1",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
  });
});

module.exports = router;
