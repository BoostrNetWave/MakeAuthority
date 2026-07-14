const CoFounderProfile = require("../models/CoFounderProfile");

// ── MATCH SCORE ALGORITHM ─────────────────────────────────────────────────────
const calculateCoFounderScore = (myProfile, theirProfile) => {
  let score = 0;
  const breakdown = {
    roleComplement: false,
    industryMatch:  false,
    locationMatch:  false,
    skillsMatch:    false,
  };

  // 1. Role Complementarity (40pts) — bidirectional check
  const iComplementThem = myProfile.currentRole === theirProfile.lookingForRole;
  const theyComplementMe = theirProfile.currentRole === myProfile.lookingForRole;

  if (iComplementThem && theyComplementMe) {
    score += 40; // perfect mutual complement
    breakdown.roleComplement = true;
  } else if (iComplementThem || theyComplementMe) {
    score += 25; // one-way complement
    breakdown.roleComplement = true;
  }

  // 2. Industry Interests Match (20pts)
  if (myProfile.industryInterests?.length > 0 && theirProfile.industryInterests?.length > 0) {
    const overlap = myProfile.industryInterests.filter(i =>
      theirProfile.industryInterests.includes(i)
    );
    if (overlap.length > 0) {
      score += Math.min(20, overlap.length * 7); // up to 20pts
      breakdown.industryMatch = true;
    }
  }

  // 3. Location Match (15pts)
  const myCity    = myProfile.city?.toLowerCase();
  const theirCity = theirProfile.city?.toLowerCase();
  const myCountry = myProfile.country?.toLowerCase();
  const theirCountry = theirProfile.country?.toLowerCase();

  if (myCity && theirCity && myCity === theirCity) {
    score += 15; // same city
    breakdown.locationMatch = true;
  } else if (myCountry && theirCountry && myCountry === theirCountry) {
    score += 7; // same country
    breakdown.locationMatch = true;
  }

  // 4. Shared Skills (25pts)
  if (myProfile.skills?.length > 0 && theirProfile.skills?.length > 0) {
    const mySkills    = myProfile.skills.map(s => s.toLowerCase());
    const theirSkills = theirProfile.skills.map(s => s.toLowerCase());
    const sharedSkills = mySkills.filter(s => theirSkills.includes(s));

    if (sharedSkills.length > 0) {
      score += Math.min(25, sharedSkills.length * 8); // up to 25pts
      breakdown.skillsMatch = true;
    }
  }

  return { score: Math.min(score, 100), breakdown };
};

// ── CREATE PROFILE ────────────────────────────────────────────────────────────
const createCoFounderProfile = async (req, res) => {
  try {
    const existing = await CoFounderProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists. Use update instead.",
      });
    }

    const profile = await CoFounderProfile.create({
      ...req.body,
      user: req.user._id,
    });

    return res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error("createCoFounderProfile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── GET MY PROFILE ────────────────────────────────────────────────────────────
const getMyCoFounderProfile = async (req, res) => {
  try {
    const profile = await CoFounderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
const updateCoFounderProfile = async (req, res) => {
  try {
    const profile = await CoFounderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    Object.assign(profile, req.body);
    await profile.save();
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── GET MATCHES ───────────────────────────────────────────────────────────────
const getCoFounderMatches = async (req, res) => {
  try {
    const myProfile = await CoFounderProfile.findOne({ user: req.user._id });
    if (!myProfile) {
      return res.status(404).json({
        success: false,
        message: "Create your co-founder profile first to get matched.",
        matches: [],
      });
    }

    const limit = parseInt(req.query.limit) || 12;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    // Get all active profiles except own, filter orphan records
    const profiles = (await CoFounderProfile.find({
      user:   { $ne: req.user._id },
      status: { $ne: "not_looking" },
    }).populate("user", "name email avatar"))
      .filter(p => p.user); // orphan protection

    // Score each profile
    const scored = profiles.map(profile => {
      const { score, breakdown } = calculateCoFounderScore(myProfile, profile);
      return {
        _id:               profile._id,
        user:              profile.user,
        currentRole:       profile.currentRole,
        lookingForRole:    profile.lookingForRole,
        skills:            profile.skills,
        industryInterests: profile.industryInterests,
        experienceYears:   profile.experienceYears,
        bio:               profile.bio,
        linkedinUrl:       profile.linkedinUrl,
        city:              profile.city,
        country:           profile.country,
        status:            profile.status,
        profileViews:      profile.profileViews,
        matchScore:        score,
        breakdown,
      };
    });

    // Stable sort — score desc, then experience desc
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (b.experienceYears || 0) - (a.experienceYears || 0);
    });

    const paginated = scored.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      total:   scored.length,
      page,
      limit,
      matches: paginated,
    });
  } catch (error) {
    console.error("getCoFounderMatches error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── SEND CONNECTION REQUEST ───────────────────────────────────────────────────
const sendConnectionRequest = async (req, res) => {
  try {
    const targetProfile = await CoFounderProfile.findById(req.params.id);
    if (!targetProfile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    // Check if already connected
    const alreadyConnected = targetProfile.connections.some(
      c => c.user.toString() === req.user._id.toString()
    );
    if (alreadyConnected) {
      return res.status(409).json({ success: false, message: "Connection request already sent." });
    }

    // Add connection request
    targetProfile.connections.push({
      user:   req.user._id,
      status: "pending",
    });
    await targetProfile.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Connection request sent successfully.",
    });
  } catch (error) {
    console.error("sendConnectionRequest error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ── GET ALL (public directory) ────────────────────────────────────────────────
const getAllCoFounders = async (req, res) => {
  try {
    const { role, industry, city, page = 1, limit = 12 } = req.query;

    const filter = { status: { $ne: "not_looking" } };
    if (role)     filter.currentRole       = role;
    if (industry) filter.industryInterests = { $in: [industry] };
    if (city)     filter.city              = new RegExp(city, "i");

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await CoFounderProfile.countDocuments(filter);

    const profiles = (await CoFounderProfile.find(filter)
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)))
      .filter(p => p.user);

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      profiles,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createCoFounderProfile,
  getMyCoFounderProfile,
  updateCoFounderProfile,
  getCoFounderMatches,
  sendConnectionRequest,
  getAllCoFounders,
};