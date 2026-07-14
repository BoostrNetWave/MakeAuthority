const FounderProfile   = require("../models/founderProfile.model");
const StartupBookmark  = require("../models/StartupBookmark");

// ─── GET ALL STARTUPS (public, with search + filters) ────────────────────────
// GET /api/startups?industry=fintech&stage=seed&city=Bengaluru&page=1&limit=12

const getAllStartups = async (req, res) => {
  try {
    const {
      industry,
      fundingStage,
      revenueStage,
      city,
      state,
      search,
      techStack,
      page  = 1,
      limit = 12,
    } = req.query;

    // Only show approved startups publicly
    const filter = { isApproved: true };

    if (industry)     filter.industry     = industry;
    if (fundingStage) filter.fundingStage = fundingStage;
    if (revenueStage) filter.revenueStage = revenueStage;
    if (city)         filter.city         = new RegExp(city, "i");
    if (state)        filter.state        = new RegExp(state, "i");
    if (techStack)    filter.techStack    = { $in: techStack.split(",") };

    // Search by startup name or description
    if (search) {
      filter.$or = [
        { startupName:  new RegExp(search, "i") },
        { description:  new RegExp(search, "i") },
        { tagline:      new RegExp(search, "i") },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await FounderProfile.countDocuments(filter);

    const startups = await FounderProfile.find(filter)
      .populate("user", "name avatar")
      .select("-pitchDeck") // don't expose pitch deck in list view
      .sort({ profileViews: -1, createdAt: -1 }) // popular first
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      startups,
    });

  } catch (error) {
    console.error("getAllStartups error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE STARTUP BY SLUG (public) ─────────────────────────────────────
// GET /api/startups/:slug

const getStartupBySlug = async (req, res) => {
  try {
    const startup = await FounderProfile.findOne({
      slug:       req.params.slug,
      isApproved: true,
    }).populate("user", "name avatar email");

    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found." });
    }

    // Increment views
    startup.profileViews += 1;
    await startup.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, startup });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — GET ALL (including unapproved) ───────────────────────────────────
// GET /api/startups/admin/all

const adminGetAllStartups = async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await FounderProfile.countDocuments(filter);

    const startups = await FounderProfile.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({ success: true, total, startups });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — APPROVE STARTUP ──────────────────────────────────────────────────
// PATCH /api/startups/:id/approve

const approveStartup = async (req, res) => {
  try {
    const startup = await FounderProfile.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        isVerified: true,
        verifiedAt: new Date(),
      },
      { returnDocument: 'after' }
    );

    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Startup approved successfully.",
      startup,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — REJECT STARTUP ───────────────────────────────────────────────────
// PATCH /api/startups/:id/reject

const rejectStartup = async (req, res) => {
  try {
    const startup = await FounderProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isVerified: false },
      { returnDocument: 'after' }
    );

    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Startup rejected.",
      startup,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── TOGGLE BOOKMARK (auth-required) ─────────────────────────────────────────
// POST /api/startups/:id/save

const toggleStartupBookmark = async (req, res) => {
  try {
    const startupId = req.params.id;
    const userId    = req.user._id;

    // Verify startup exists
    const startup = await FounderProfile.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found." });
    }

    const existing = await StartupBookmark.findOne({ user: userId, startup: startupId });

    if (existing) {
      // Un-save
      await existing.deleteOne();
      await FounderProfile.findByIdAndUpdate(startupId, { $inc: { bookmarkCount: -1 } });
      return res.status(200).json({ success: true, saved: false, message: "Startup removed from saved list." });
    } else {
      // Save
      await StartupBookmark.create({ user: userId, startup: startupId });
      await FounderProfile.findByIdAndUpdate(startupId, { $inc: { bookmarkCount: 1 } });
      return res.status(200).json({ success: true, saved: true, message: "Startup saved successfully." });
    }
  } catch (error) {
    console.error("toggleStartupBookmark error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET MY SAVED STARTUPS ────────────────────────────────────────────────────
// GET /api/startups/saved/me

const getMySavedStartups = async (req, res) => {
  try {
    const bookmarks = await StartupBookmark.find({ user: req.user._id })
      .populate("startup")
      .sort({ createdAt: -1 });

    const startups = bookmarks.map(b => b.startup).filter(Boolean);
    return res.status(200).json({ success: true, startups });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getAllStartups,
  getStartupBySlug,
  adminGetAllStartups,
  approveStartup,
  rejectStartup,
  toggleStartupBookmark,
  getMySavedStartups,
};