const InvestorProfile = require("../models/investorProfile.model");
const FounderProfile  = require("../models/founderProfile.model");

// ─── GET ALL INVESTORS (public, search + filter) ──────────────────────────────
// GET /api/investors?type=angel&industry=fintech&stage=seed&city=Mumbai

const getAllInvestors = async (req, res) => {
  try {
    const {
      investorType,
      industry,
      stage,
      city,
      ticketMin,
      ticketMax,
      search,
      page  = 1,
      limit = 12,
    } = req.query;

    // Only show admin-verified investors publicly
    const filter = { isVerifiedByAdmin: true };

    if (investorType) filter.investorType = investorType;
    if (city)         filter.city         = new RegExp(city, "i");

    if (industry) {
      filter.industriesOfInterest = { $in: [industry] };
    }
    if (stage) {
      filter.investmentStages = { $in: [stage] };
    }

    // Ticket size range filter
    if (ticketMin) filter.ticketSizeMax = { $gte: Number(ticketMin) };
    if (ticketMax) filter.ticketSizeMin = { $lte: Number(ticketMax) };

    // Search by name or firm
    if (search) {
      filter.$or = [
        { firmName: new RegExp(search, "i") },
        { bio:      new RegExp(search, "i") },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await InvestorProfile.countDocuments(filter);

    const investors = await InvestorProfile.find(filter)
      .populate("user", "name avatar email")
      .select("-casData -savedStartups") // don't expose sensitive data in list
      .sort({ investorStrengthScore: -1, createdAt: -1 }) // strongest first
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      investors,
    });

  } catch (error) {
    console.error("getAllInvestors error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE INVESTOR (public) ─────────────────────────────────────────────
// GET /api/investors/:id

const getInvestorById = async (req, res) => {
  try {
    const investor = await InvestorProfile.findOne({
      _id:               req.params.id,
      isVerifiedByAdmin: true,
    }).populate("user", "name avatar");

    if (!investor) {
      return res.status(404).json({ success: false, message: "Investor not found." });
    }

    // Increment profile views
    investor.profileViews += 1;
    await investor.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, investor });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── FOUNDER SAVES AN INVESTOR ────────────────────────────────────────────────
// POST /api/investors/:id/save  (founder only)

const saveInvestor = async (req, res) => {
  try {
    const investorProfile = await InvestorProfile.findById(req.params.id);
    if (!investorProfile) {
      return res.status(404).json({ success: false, message: "Investor not found." });
    }

    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    // Toggle save — if already saved, unsave
    const alreadySaved = investorProfile.savedStartups.includes(founderProfile._id);

    if (alreadySaved) {
      investorProfile.savedStartups.pull(founderProfile._id);
    } else {
      investorProfile.savedStartups.push(founderProfile._id);
      investorProfile.bookmarkCount = (investorProfile.bookmarkCount || 0) + 1;
    }

    await investorProfile.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: alreadySaved ? "Investor unsaved." : "Investor saved.",
      saved:   !alreadySaved,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — GET ALL INVESTORS (including unapproved) ─────────────────────────
// GET /api/investors/admin/all

const adminGetAllInvestors = async (req, res) => {
  try {
    const { isVerifiedByAdmin, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (isVerifiedByAdmin !== undefined) {
      filter.isVerifiedByAdmin = isVerifiedByAdmin === "true";
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await InvestorProfile.countDocuments(filter);

    const investors = await InvestorProfile.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({ success: true, total, investors });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — APPROVE INVESTOR ─────────────────────────────────────────────────
// PATCH /api/investors/:id/approve

const approveInvestor = async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Also approve the profile if it exists
    const InvestorProfile = require("../models/investorProfile.model");
    await InvestorProfile.findOneAndUpdate(
      { user: user._id },
      { isVerifiedByAdmin: true, verifiedAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: "Investor approved. They can now login.",
      investor: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getAllInvestors,
  getInvestorById,
  saveInvestor,
  adminGetAllInvestors,
  approveInvestor,
};