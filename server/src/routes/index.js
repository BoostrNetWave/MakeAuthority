const { Router } = require("express");
const authRoutes        = require("./auth.routes");
const profileRoutes     = require("./profile.routes");
const startupRoutes     = require("./startup.routes");
const investorRoutes    = require("./investor.routes");
const grantRoutes       = require("./grant.routes");
const applicationRoutes = require("./application.routes");
const adminRoutes       = require("./admin.routes");
const matchmakingRoutes = require("./matchmaking.routes");
const incubatorRoutes = require("./incubator.routes");
const jobRoutes         = require("./job.routes");
const jobApplicationRoutes = require("./jobApplication.routes");
const coFounderRoutes   = require("./cofounder.routes");
const uploadRoutes      = require("./upload.routes");
const serviceRoutes     = require("./service.routes");
const eventRoutes       = require("./event.routes");
const communityRoutes   = require("./community.routes");

const aiRoutes          = require("./ai.routes");
const documentRoutes    = require("./document.routes");
const notificationRoutes = require("./notification.routes");

const FounderProfile = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");
const Grant = require("../models/Grant");
const Incubator = require("../models/incubator");
const Application = require("../models/application");
const Job = require("../models/Job");

const router = Router();

router.get("/ecosystem-stats", async (req, res) => {
  try {
    const startupsCount = await FounderProfile.countDocuments({ isApproved: true });
    const investorsCount = await InvestorProfile.countDocuments({ isVerifiedByAdmin: true });
    const grantsCount = await Grant.countDocuments({ isActive: true });
    const incubatorsCount = await Incubator.countDocuments({ isActive: true });
    const jobsCount = await Job.countDocuments({ status: "Open" });

    // Aggregate capital raised or secured from funded applications
    const totalFundedResult = await Application.aggregate([
      { $match: { status: "funded" } },
      { $group: { _id: null, total: { $sum: "$fundedAmount" } } }
    ]);
    const totalFunded = totalFundedResult[0]?.total || 0;

    // Aggregate total available grant funding
    const totalGrantsFundingResult = await Grant.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$fundingAmountMax" } } }
    ]);
    const totalGrantsFunding = totalGrantsFundingResult[0]?.total || 0;

    // Standardized Success Rate: ratio of accepted/funded applications to total submitted applications
    const totalApps = await Application.countDocuments({ status: { $ne: "draft" } });
    const successfulApps = await Application.countDocuments({ status: { $in: ["accepted", "funded"] } });
    const successRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 88; // fallback to 88% if no apps yet

    return res.status(200).json({
      success: true,
      startupsCount,
      investorsCount,
      grantsCount,
      incubatorsCount,
      jobsCount,
      totalCapital: totalFunded,
      totalGrantsFunding,
      successRate,
    });
  } catch (error) {
    console.error("Ecosystem stats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.use("/auth",         authRoutes);
router.use("/profile",      profileRoutes);
router.use("/startups",     startupRoutes);
router.use("/investors",    investorRoutes);
router.use("/grants",       grantRoutes);
router.use("/applications", applicationRoutes);
router.use("/admin",        adminRoutes);
router.use("/matchmaking",  matchmakingRoutes);
router.use("/incubators", incubatorRoutes);
router.use("/jobs",         jobRoutes);
router.use("/job-applications", jobApplicationRoutes);
router.use("/cofounders",   coFounderRoutes);
router.use("/upload",       uploadRoutes);
router.use("/services",     serviceRoutes);
router.use("/events",       eventRoutes);
router.use("/community",    communityRoutes);
router.use("/ai",           aiRoutes);
router.use("/documents",    documentRoutes);
router.use("/notifications",notificationRoutes);

module.exports = router;
