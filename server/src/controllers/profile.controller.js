const FounderProfile  = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");

// ─── FOUNDER ─────────────────────────────────────────────────────────────────

// POST /api/profile/founder
const createFounderProfile = async (req, res) => {
  try {
    const existing = await FounderProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Founder profile already exists. Use update instead.",
      });
    }

    const profile = await FounderProfile.create({
      user: req.user._id,
      ...req.body,
    });

    profile.calculateCompletion();
    await profile.save();

    return res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error("createFounderProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/profile/founder/me
const getMyFounderProfile = async (req, res) => {
  try {
    const profile = await FounderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PUT /api/profile/founder/me
const updateFounderProfile = async (req, res) => {
  try {
    const profile = await FounderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found. Create one first." });
    }

    // Merge updates
    Object.assign(profile, req.body);
    profile.calculateCompletion();
    await profile.save();

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("updateFounderProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/profile/founder/:slug  (public)
const getFounderProfileBySlug = async (req, res) => {
  try {
    const profile = await FounderProfile.findOne({ slug: req.params.slug })
      .populate("user", "name email avatar");

    if (!profile || !profile.isApproved) {
      return res.status(404).json({ success: false, message: "Startup not found." });
    }

    // Increment profile views
    profile.profileViews += 1;
    await profile.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── INVESTOR ────────────────────────────────────────────────────────────────

// POST /api/profile/investor
const createInvestorProfile = async (req, res) => {
  try {
    const existing = await InvestorProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Investor profile already exists. Use update instead.",
      });
    }

    const profile = await InvestorProfile.create({
      user: req.user._id,
      ...req.body,
    });

    profile.calculateStrengthScore();
    await profile.save();

    return res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error("createInvestorProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/profile/investor/me
const getMyInvestorProfile = async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PUT /api/profile/investor/me
const updateInvestorProfile = async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found. Create one first." });
    }

    Object.assign(profile, req.body);
    profile.calculateStrengthScore();
    await profile.save();

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("updateInvestorProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createFounderProfile,
  getMyFounderProfile,
  updateFounderProfile,
  getFounderProfileBySlug,
  createInvestorProfile,
  getMyInvestorProfile,
  updateInvestorProfile,
};