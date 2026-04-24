const express = require("express");
const router = express.Router();
const {
  createShortUrl,
  getAllUrls,
  getUrlStats,
  deleteUrl,
} = require("../controllers/urlController");

router.post("/", createShortUrl);
router.get("/", getAllUrls);
router.get("/:id", getUrlStats);
router.delete("/:id", deleteUrl);

module.exports = router;
