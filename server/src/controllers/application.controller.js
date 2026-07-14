const Application    = require("../models/application");
const FounderProfile = require("../models/founderProfile.model");
const Incubator      = require("../models/incubator");
const InvestorProfile = require("../models/investorProfile.model");

// POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { targetType, grant, investor, incubator, notes, isExternal, externalName, externalOrg, status } = req.body;

    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    if (!isExternal) {
      if (targetType === "grant" && !grant)
        return res.status(400).json({ success: false, message: "Grant ID is required." });
      if (targetType === "investor" && !investor)
        return res.status(400).json({ success: false, message: "Investor ID is required." });
      if (targetType === "incubator" && !incubator)
        return res.status(400).json({ success: false, message: "Incubator ID is required." });
    } else {
      if (!externalName)
        return res.status(400).json({ success: false, message: "External lead name is required." });
    }

    const application = await Application.create({
      founder:      founderProfile._id,
      targetType,
      grant:        targetType === "grant"     && !isExternal ? grant     : null,
      investor:     targetType === "investor"  && !isExternal ? investor  : null,
      incubator:    targetType === "incubator" && !isExternal ? incubator : null,
      isExternal:   isExternal   || false,
      externalName: externalName || null,
      externalOrg:  externalOrg  || null,
      status:       status       || "submitted",
      notes:        notes        || null,
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    console.error("createApplication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/applications/me
const getMyApplications = async (req, res) => {
  try {
    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile)
      return res.status(404).json({ success: false, message: "Startup profile not found." });

    const { status, targetType } = req.query;
    const filter = { founder: founderProfile._id };
    if (status)     filter.status     = status;
    if (targetType) filter.targetType = targetType;

    const applications = await Application.find(filter)
      .populate("grant")
      .populate({ path: "investor", populate: { path: "user", select: "name email avatar" } })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/applications/stats
const getApplicationStats = async (req, res) => {
  try {
    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile)
      return res.status(404).json({ success: false, message: "Startup profile not found." });

    const base = { founder: founderProfile._id };
    const [total, accepted, underReview, rejected, submitted] = await Promise.all([
      Application.countDocuments(base),
      Application.countDocuments({ ...base, status: { $in: ["accepted", "funded"] } }),
      Application.countDocuments({ ...base, status: "under_review" }),
      Application.countDocuments({ ...base, status: "rejected" }),
      Application.countDocuments({ ...base, status: "submitted" }),
    ]);

    return res.status(200).json({ success: true, stats: { total, accepted, underReview, rejected, submitted } });
  } catch (error) {
    console.error("getApplicationStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingStatus, meetingDate, notes, fundedAmount } = req.body;

    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile)
      return res.status(404).json({ success: false, message: "Startup profile not found." });

    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ success: false, message: "Application not found." });

    if (application.founder.toString() !== founderProfile._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to update this application." });

    if (status       !== undefined) application.status        = status;
    if (meetingStatus !== undefined) application.meetingStatus = meetingStatus;
    if (meetingDate  !== undefined) application.meetingDate   = meetingDate;
    if (notes        !== undefined) application.notes         = notes;
    if (fundedAmount !== undefined) application.fundedAmount  = fundedAmount;

    await application.save();
    return res.status(200).json({ success: true, application });
  } catch (error) {
    console.error("updateApplication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PATCH /api/applications/:id/review
// Incubator or investor reviews an application directed at them
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const ALLOWED = ["under_review", "accepted", "rejected"];
    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${ALLOWED.join(", ")}` });
    }

    const application = await Application.findById(id)
      .populate("founder", "startupName industry city logo");
    if (!application)
      return res.status(404).json({ success: false, message: "Application not found." });

    // Verify the application is directed at THIS user's profile
    if (req.user.role === "incubator") {
      const incubator = await Incubator.findOne({ user: req.user._id });
      if (!incubator || application.incubator?.toString() !== incubator._id.toString()) {
        return res.status(403).json({ success: false, message: "This application is not directed at your incubator." });
      }
    } else if (req.user.role === "investor") {
      const investor = await InvestorProfile.findOne({ user: req.user._id });
      if (!investor || application.investor?.toString() !== investor._id.toString()) {
        return res.status(403).json({ success: false, message: "This application is not directed at your investor profile." });
      }
    } else {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    return res.status(200).json({ success: true, application });
  } catch (error) {
    console.error("reviewApplication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const founderProfile = await FounderProfile.findOne({ user: req.user._id });
    if (!founderProfile)
      return res.status(404).json({ success: false, message: "Startup profile not found." });

    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ success: false, message: "Application not found." });

    if (application.founder.toString() !== founderProfile._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this application." });

    await application.deleteOne();
    return res.status(200).json({ success: true, message: "Application deleted successfully." });
  } catch (error) {
    console.error("deleteApplication error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationStats,
  updateApplication,
  reviewApplication,
  deleteApplication,
};
