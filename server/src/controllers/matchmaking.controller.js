const FounderProfile  = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");

const calculateMatchScore = (startup, investor) => {
  let score = 0;
  const breakdown = {
    industry:   false,
    stage:      false,
    ticketSize: "none",
    geography:  false,
  };

  // 1. Industry Match (40%) — case-insensitive
  if (investor.industriesOfInterest?.length > 0) {
    const match = investor.industriesOfInterest.some(i =>
      i.toLowerCase() === startup.industry?.toLowerCase()
    );
    if (match) { score += 40; breakdown.industry = true; }
  }

  // 2. Stage Match (30%) — case-insensitive
  if (investor.investmentStages?.length > 0) {
    const match = investor.investmentStages.some(s =>
      s.toLowerCase() === startup.fundingStage?.toLowerCase()
    );
    if (match) { score += 30; breakdown.stage = true; }
  }

  // 3. Ticket Size (20%) — type-safe numeric
  const req = Number(startup.fundingRequired);
  const min = Number(investor.ticketSizeMin);
  const max = Number(investor.ticketSizeMax);

  if (req && min && max) {
    if (req >= min && req <= max) {
      score += 20;
      breakdown.ticketSize = "exact";
    } else {
      const lower = min * 0.7;
      const upper = max * 1.3;
      if (req >= lower && req <= upper) {
        score += 10;
        breakdown.ticketSize = "partial";
      }
    }
  } else {
    // No ticket constraints — neutral partial match
    score += 10;
    breakdown.ticketSize = "partial";
  }

  // 4. Geography (10%) — bidirectional substring
  if (investor.geographicPreference?.length > 0) {
    const startupLocs = [startup.city, startup.state, startup.country]
      .filter(Boolean)
      .map(s => s.toLowerCase());

    const hasGeoMatch = investor.geographicPreference.some(pref => {
      const p = pref.toLowerCase();
      return startupLocs.some(loc => loc.includes(p) || p.includes(loc));
    });

    if (hasGeoMatch) { score += 10; breakdown.geography = true; }
  } else {
    // No preference — default match
    score += 10;
    breakdown.geography = true;
  }

  return { score, breakdown };
};

// GET /api/matchmaking/investors — Founder only
const getMatchedInvestors = async (req, res) => {
  try {
    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile) {
      return res.status(404).json({
        success: false,
        message: "Create your startup profile first to get matched.",
        matches: [],
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    // Fix 5 — filter orphan records
    const investors = (await InvestorProfile.find()
      .populate("user", "name email avatar"))
      .filter(inv => inv.user);

    const scored = investors.map(investor => {
      const { score, breakdown } = calculateMatchScore(founderProfile, investor);
      return {
        _id:                  investor._id,
        user:                 investor.user,
        firmName:             investor.firmName,
        designation:          investor.designation,
        bio:                  investor.bio,
        investorType:         investor.investorType,
        ticketSizeMin:        investor.ticketSizeMin,
        ticketSizeMax:        investor.ticketSizeMax,
        industriesOfInterest: investor.industriesOfInterest,
        investmentStages:     investor.investmentStages,
        geographicPreference: investor.geographicPreference,
        matchScore:           score,
        breakdown,
      };
    });

    // Fix 4 — stable sort with secondary alphabetical
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (a.firmName || '').localeCompare(b.firmName || '');
    });

    const paginated = scored.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      total:     scored.length,
      page,
      limit,
      investors: paginated,
    });
  } catch (error) {
    console.error("getMatchedInvestors error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while calculating matches.",
    });
  }
};

// GET /api/matchmaking/startups — Investor only
const getMatchedStartups = async (req, res) => {
  try {
    const investorProfile = await InvestorProfile.findOne({ user: req.user._id });
    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Set up your investor profile first to get matched.",
        matches: [],
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    // Fix 5 — filter orphan records
    const startups = (await FounderProfile.find()
      .populate("user", "name email avatar"))
      .filter(s => s.user);

    const scored = startups.map(startup => {
      const { score, breakdown } = calculateMatchScore(startup, investorProfile);
      return {
        _id:             startup._id,
        user:            startup.user,
        startupName:     startup.startupName,
        slug:            startup.slug,
        logo:            startup.logo,
        tagline:         startup.tagline,
        description:     startup.description,
        industry:        startup.industry,
        sector:          startup.sector,
        fundingStage:    startup.fundingStage,
        fundingRequired: startup.fundingRequired,
        city:            startup.city,
        state:           startup.state,
        matchScore:      score,
        breakdown,
      };
    });

    // Fix 4 — stable sort with secondary alphabetical
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (a.startupName || '').localeCompare(b.startupName || '');
    });

    const paginated = scored.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      total:    scored.length,
      page,
      limit,
      startups: paginated,
    });
  } catch (error) {
    console.error("getMatchedStartups error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while calculating matches.",
    });
  }
};

module.exports = { getMatchedInvestors, getMatchedStartups };