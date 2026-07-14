const Incubator = require("../models/incubator");

// ─── PUBLIC — GET ALL ─────────────────────────────────────────────────────────
const getAllIncubators = async (req, res) => {
  try {
    const {
      category, industry, stage,
      city, search, page = 1, limit = 9,
    } = req.query;

    const filter = { isActive: true, isVerified: true };

    if (category) filter.category = category;
    if (city)     filter.city     = new RegExp(city, "i");
    if (industry && industry !== "all") {
      filter.eligibleIndustries = { $in: [industry, "all"] };
    }
    if (stage) {
      filter.eligibleStages = { $in: [stage] };
    }
    if (search) {
      filter.$or = [
        { organizationName: new RegExp(search, "i") },
        { programName:      new RegExp(search, "i") },
        { description:      new RegExp(search, "i") },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Incubator.countDocuments(filter);

    const incubators = await Incubator.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true, total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      incubators,
    });
  } catch (error) {
    console.error("getAllIncubators error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── PUBLIC — GET BY SLUG ─────────────────────────────────────────────────────
const getIncubatorBySlug = async (req, res) => {
  try {
    const incubator = await Incubator.findOne({
      slug: req.params.slug, isActive: true, isVerified: true,
    }).populate("user", "name email");

    if (!incubator) {
      return res.status(404).json({ success: false, message: "Incubator not found." });
    }

    incubator.viewCount += 1;
    await incubator.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, incubator });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── INCUBATOR USER — CREATE PROFILE ─────────────────────────────────────────
const createIncubatorProfile = async (req, res) => {
  try {
    const existing = await Incubator.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists. Use update instead.",
      });
    }

    const incubator = await Incubator.create({
      ...req.body,
      user: req.user._id,
    });

    return res.status(201).json({ success: true, incubator });
  } catch (error) {
    console.error("createIncubatorProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── INCUBATOR USER — UPDATE PROFILE ─────────────────────────────────────────
const updateIncubatorProfile = async (req, res) => {
  try {
    const incubator = await Incubator.findOne({ user: req.user._id });
    if (!incubator) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    Object.assign(incubator, req.body);
    await incubator.save();

    return res.status(200).json({ success: true, incubator });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── INCUBATOR USER — GET MY PROFILE ─────────────────────────────────────────
const getMyIncubatorProfile = async (req, res) => {
  try {
    const incubator = await Incubator.findOne({ user: req.user._id });
    if (!incubator) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    return res.status(200).json({ success: true, incubator });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── FOUNDER — APPLY TO INCUBATOR ────────────────────────────────────────────
const applyToIncubator = async (req, res) => {
  try {
    const Application = require("../models/application");
    const FounderProfile = require("../models/founderProfile.model");

    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile) {
      return res.status(404).json({
        success: false,
        message: "Create your startup profile first.",
      });
    }

    const application = await Application.create({
      founder:    founderProfile._id,
      incubator:  req.params.id,
      targetType: "incubator",
      status:     "submitted",
    });

    // Increment application count
    await Incubator.findByIdAndUpdate(req.params.id, {
      $inc: { applicationCount: 1 },
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    console.error("applyToIncubator error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── INCUBATOR — GET RECEIVED APPLICATIONS ───────────────────────────────────
const getMyApplications = async (req, res) => {
  try {
    const incubator = await Incubator.findOne({ user: req.user._id });
    if (!incubator) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const Application = require("../models/application");
    const applications = await Application.find({
      targetType: "incubator",
      incubator: incubator._id,
    })
      .populate("founder", "startupName industry city logo tagline")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — CREATE INCUBATOR LISTING ────────────────────────────────────────
const adminCreateIncubator = async (req, res) => {
  try {
    const User = require("../models/User");
    let userId = req.body.user;

    if (!userId) {
      // Provision a dedicated owner user account for the program
      const slug = req.body.organizationName
        ? req.body.organizationName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + "-" + Math.floor(Math.random() * 100000)
        : "incubator-" + Math.floor(Math.random() * 100000);
      const email = `${slug}@boostr-incubator.com`;

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: req.body.organizationName ? `${req.body.organizationName} Admin` : "Incubator Admin",
          email,
          password: "password123",
          role: "incubator",
          isApproved: true,
        });
      }
      userId = user._id;
    }

    const incubator = await Incubator.create({
      ...req.body,
      user: userId,
      isVerified: true,
    });
    return res.status(201).json({ success: true, incubator });
  } catch (error) {
    console.error("adminCreateIncubator error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN — VERIFY INCUBATOR ────────────────────────────────────────────────
const verifyIncubator = async (req, res) => {
  try {
    const incubator = await Incubator.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { returnDocument: 'after' }
    );

    if (!incubator) {
      return res.status(404).json({ success: false, message: "Incubator not found." });
    }

    const User = require("../models/User");
    await User.findByIdAndUpdate(
      incubator.user,
      { isApproved: true }
    );

    return res.status(200).json({ success: true, message: "Incubator verified. They can now login.", incubator });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getAllIncubators,
  getIncubatorBySlug,
  createIncubatorProfile,
  updateIncubatorProfile,
  getMyIncubatorProfile,
  applyToIncubator,
  getMyApplications,
  adminCreateIncubator,
  verifyIncubator,
};