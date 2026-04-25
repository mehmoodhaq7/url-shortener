const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error(`Redis error: ${err.message}`));

module.exports = redis;
