const User            = require("../models/User");
const FounderProfile  = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");
const Grant           = require("../models/Grant");
const Application     = require("../models/application");
const Incubator       = require("../models/incubator");

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStartups,
      totalInvestors,
      totalGrants,
      totalApplications,
      pendingStartups,
      pendingInvestors,
      pendingIncubators,
      pendingServiceProviders,
      founderCount,
      investorCount,
      incubatorCount,
      jobSeekerCount,
      serviceProviderCount,
    ] = await Promise.all([
      User.countDocuments(),
      FounderProfile.countDocuments(),
      InvestorProfile.countDocuments(),
      Grant.countDocuments({ isActive: true }),
      Application.countDocuments(),
      FounderProfile.countDocuments({ isApproved: false }),
      User.countDocuments({ role: 'investor', isApproved: false }),
      User.countDocuments({ role: 'incubator', isApproved: false }),
      User.countDocuments({ role: 'service_provider', isApproved: false }),
      User.countDocuments({ role: 'founder' }),
      User.countDocuments({ role: 'investor' }),
      User.countDocuments({ role: 'incubator' }),
      User.countDocuments({ role: 'job_seeker' }),
      User.countDocuments({ role: 'service_provider' }),
    ]);

    const pendingVerifications = pendingStartups + pendingInvestors + pendingIncubators + pendingServiceProviders;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStartups,
        totalInvestors,
        totalGrants,
        totalApplications,
        pendingVerifications,
        pendingStartups,
        pendingInvestors,
        pendingIncubators,
        pendingServiceProviders,
        userRoles: {
          founders:         founderCount,
          investors:        investorCount,
          incubators:       incubatorCount,
          jobSeekers:       jobSeekerCount,
          serviceProviders: serviceProviderCount,
        },
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/admin/pending-startups
const getPendingStartups = async (req, res) => {
  try {
    const startups = await FounderProfile.find({ isApproved: false })
      .populate("user", "name email createdAt")
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, startups });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/admin/pending-investors
const getPendingInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor', isApproved: false })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, investors });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/admin/pending-incubators
const getPendingIncubators = async (req, res) => {
  try {
    const incubators = await User.find({ role: 'incubator', isApproved: false })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, incubators });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/admin/pending-service-providers
const getPendingServiceProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'service_provider', isApproved: false })
      .select('name email createdAt role')
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, providers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PATCH /api/admin/users/:id/approve
// Generic approval for investor, incubator, service_provider
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const APPROVABLE_ROLES = ['investor', 'incubator', 'service_provider'];
    if (!APPROVABLE_ROLES.includes(user.role)) {
      return res.status(400).json({ success: false, message: `Role '${user.role}' does not require approval.` });
    }

    user.isApproved = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: `${user.role} approved. They can now log in.`,
      user: user.toSafeObject ? user.toSafeObject() : user,
    });
  } catch (error) {
    console.error('approveUser error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    return res.status(200).json({ success: true, total, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PATCH /api/admin/users/:id/deactivate
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "User deactivated.", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getStats,
  getPendingStartups,
  getPendingInvestors,
  getPendingIncubators,
  getPendingServiceProviders,
  approveUser,
  getAllUsers,
  deactivateUser,
};
