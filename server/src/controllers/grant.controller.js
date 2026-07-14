const Grant         = require("../models/Grant");
const GrantBookmark = require("../models/GrantBookmark");

// ─── GET ALL GRANTS (public, search + filter) ─────────────────────────────────
// GET /api/grants?category=government&industry=fintech&stage=seed&search=...

const getAllGrants = async (req, res) => {
  try {
    const {
      category,
      industry,
      stage,
      womenOnly,
      search,
      sortBy = "deadline", // deadline | newest | featured
      page  = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    if (category)  filter.category = category;
    if (womenOnly === "true") filter.womenFoundersOnly = true;

    if (industry) {
      filter.eligibleIndustries = { $in: [industry, "all"] };
    }
    if (stage) {
      filter.eligibleStages = { $in: [stage] };
    }
    if (search) {
      filter.$or = [
        { grantName:    new RegExp(search, "i") },
        { organization: new RegExp(search, "i") },
        { description:  new RegExp(search, "i") },
      ];
    }

    let sort = { deadline: 1 }; // soonest deadline first
    if (sortBy === "newest")   sort = { createdAt: -1 };
    if (sortBy === "featured") sort = { isFeatured: -1, deadline: 1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Grant.countDocuments(filter);

    const grants = await Grant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      grants,
    });
  } catch (error) {
    console.error("getAllGrants error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE GRANT (public) ────────────────────────────────────────────────
// GET /api/grants/:slug

const getGrantBySlug = async (req, res) => {
  try {
    const grant = await Grant.findOne({ slug: req.params.slug, isActive: true });
    if (!grant) {
      return res.status(404).json({ success: false, message: "Grant not found." });
    }

    grant.viewCount += 1;
    await grant.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, grant });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── AI ELIGIBILITY CHECK ──────────────────────────────────────────────────────
// POST /api/grants/:slug/check-eligibility  (founder)
// Simple rule-based check for now — can be upgraded to real AI later

const checkEligibility = async (req, res) => {
  try {
    const grant = await Grant.findOne({ slug: req.params.slug });
    if (!grant) {
      return res.status(404).json({ success: false, message: "Grant not found." });
    }

    const FounderProfile = require("../models/FounderProfile");
    const profile = await FounderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const reasons = [];
    let eligible = true;

    // Industry check
    if (
      !grant.eligibleIndustries.includes("all") &&
      !grant.eligibleIndustries.includes(profile.industry)
    ) {
      eligible = false;
      reasons.push(`This grant is not open to ${profile.industry} startups.`);
    }

    // Stage check
    if (
      grant.eligibleStages.length > 0 &&
      !grant.eligibleStages.includes(profile.fundingStage)
    ) {
      eligible = false;
      reasons.push(`This grant requires funding stage: ${grant.eligibleStages.join(", ")}.`);
    }

    // Deadline check
    if (grant.isExpired()) {
      eligible = false;
      reasons.push("This grant's deadline has passed.");
    }

    if (eligible) reasons.push("Your startup matches all eligibility criteria!");

    return res.status(200).json({ success: true, eligible, reasons });
  } catch (error) {
    console.error("checkEligibility error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── BOOKMARK / UNBOOKMARK GRANT ───────────────────────────────────────────────
// POST /api/grants/:id/bookmark  (founder)

const toggleBookmark = async (req, res) => {
  try {
    const existing = await GrantBookmark.findOne({
      user:  req.user._id,
      grant: req.params.id,
    });

    if (existing) {
      await existing.deleteOne();
      await Grant.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });
      return res.status(200).json({ success: true, bookmarked: false, message: "Bookmark removed." });
    }

    await GrantBookmark.create({ user: req.user._id, grant: req.params.id });
    await Grant.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: 1 } });

    return res.status(200).json({ success: true, bookmarked: true, message: "Grant bookmarked." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET MY BOOKMARKED GRANTS ──────────────────────────────────────────────────
// GET /api/grants/bookmarks/me  (founder)

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await GrantBookmark.find({ user: req.user._id })
      .populate("grant")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookmarks: bookmarks.map(b => b.grant),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — CREATE GRANT ───────────────────────────────────────────────────────
// POST /api/grants

const createGrant = async (req, res) => {
  try {
    const grant = await Grant.create({
      ...req.body,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, grant });
  } catch (error) {
    console.error("createGrant error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — UPDATE GRANT ───────────────────────────────────────────────────────
// PUT /api/grants/:id

const updateGrant = async (req, res) => {
  try {
    const grant = await Grant.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!grant) {
      return res.status(404).json({ success: false, message: "Grant not found." });
    }
    return res.status(200).json({ success: true, grant });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — DELETE GRANT ───────────────────────────────────────────────────────
// DELETE /api/grants/:id

const deleteGrant = async (req, res) => {
  try {
    const grant = await Grant.findByIdAndDelete(req.params.id);
    if (!grant) {
      return res.status(404).json({ success: false, message: "Grant not found." });
    }
    return res.status(200).json({ success: true, message: "Grant deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getAllGrants,
  getGrantBySlug,
  checkEligibility,
  toggleBookmark,
  getMyBookmarks,
  createGrant,
  updateGrant,
  deleteGrant,
};