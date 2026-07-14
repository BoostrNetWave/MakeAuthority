const ROLES = Object.freeze({
  SUPER_ADMIN:      "super_admin",
  FOUNDER:          "founder",
  INVESTOR:         "investor",
  INCUBATOR:        "incubator",
  SERVICE_PROVIDER: "service_provider",
  JOB_SEEKER:       "job_seeker",
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

const requireApproval = (req, res, next) => {
  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "This action requires your account to be approved by an admin.",
    });
  }
  next();
};

const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address before accessing this resource.",
    });
  }
  next();
};

const requirePremium = (req, res, next) => {
  if (!req.user.hasPremiumAccess()) {
    return res.status(403).json({
      success: false,
      message: "This feature requires an active premium membership.",
    });
  }
  next();
};

module.exports = { ROLES, authorizeRoles, requireApproval, requireEmailVerified, requirePremium };
