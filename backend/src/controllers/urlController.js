const Url = require("../models/Url");
const redis = require("../config/redis");
const generateSlug = require("../utils/generateSlug");

const TTL = parseInt(process.env.REDIS_TTL) || 3600;

// POST /api/urls — shorten a URL
const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customSlug } = req.body;

    if (!originalUrl) {
      return res
        .status(400)
        .json({ success: false, message: "originalUrl is required" });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL format" });
    }

    const slug = customSlug || generateSlug();

    // Check if custom slug already taken
    if (customSlug) {
      const existing = await Url.findOne({ slug });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Slug already in use" });
      }
    }

    const url = await Url.create({ originalUrl, slug });

    return res.status(201).json({
      success: true,
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        slug: url.slug,
        shortUrl: `${process.env.BASE_URL}/${url.slug}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /:slug — redirect to original URL
const redirectToUrl = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check Redis cache first
    const cached = await redis.get(`url:${slug}`);
    if (cached) {
      await Url.findOneAndUpdate({ slug }, { $inc: { clicks: 1 } });
      return res.redirect(302, cached);
    }

    // Cache miss — hit MongoDB
    const url = await Url.findOne({ slug, isActive: true });
    if (!url) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found" });
    }

    // Store in Redis cache
    await redis.setex(`url:${slug}`, TTL, url.originalUrl);

    // Increment click count
    await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

// GET /api/urls — list all URLs
const getAllUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Url.countDocuments({ isActive: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: urls.map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        slug: url.slug,
        shortUrl: `${process.env.BASE_URL}/${url.slug}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/urls/:id — get single URL stats
const getUrlStats = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        slug: url.slug,
        shortUrl: `${process.env.BASE_URL}/${url.slug}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/urls/:id — soft delete
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }

    // Invalidate Redis cache
    await redis.del(`url:${url.slug}`);

    return res
      .status(200)
      .json({ success: true, message: "URL deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  redirectToUrl,
  getAllUrls,
  getUrlStats,
  deleteUrl,
};
