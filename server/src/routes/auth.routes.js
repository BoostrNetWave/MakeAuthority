const { Router } = require("express");
const { body } = require("express-validator");
const passport = require("../config/passport");
const OAuthCode = require("../models/OAuthCode");
const jwt = require("jsonwebtoken");
const { 
  register, 
  login, 
  logout, 
  getMe, 
  refreshToken, 
  updateProfile,
  updateMe,
  changePassword,
  updateNotificationPreferences,
  deleteMe
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = Router();

const VALID_ROLES = ["founder", "investor", "incubator", "service_provider", "job_seeker"];

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role")
    .optional()
    .isIn(VALID_ROLES)
    .withMessage(`Role must be one of: ${VALID_ROLES.join(", ")}.`),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required."),
];

router.post("/register", registerValidation, register);
router.post("/login",    loginValidation,    login);
router.post("/logout",   logout);
router.post("/refresh",  refreshToken);
router.get("/me",        protect,            getMe);
router.patch('/me', protect, updateMe);
router.patch('/change-password', protect, changePassword);
router.patch('/notification-preferences', protect, updateNotificationPreferences);
router.delete('/me', protect, deleteMe);
router.put("/profile", protect, updateProfile);

// ── GOOGLE ──────────────────────────────────────────────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
)

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_ORIGIN?.replace(/\/$/, '')}/login?error=google_failed` }),
  (req, res) => {
    const { code } = req.user
    return res.redirect(`${process.env.CLIENT_ORIGIN?.replace(/\/$/, '')}/auth/callback?code=${code}&provider=google`)
  }
)

// ── LINKEDIN ─────────────────────────────────────────────────────────────────
router.get("/linkedin",
  passport.authenticate("linkedin", { session: false })
)

router.get("/linkedin/callback",
  passport.authenticate("linkedin", { session: false, failureRedirect: `${process.env.CLIENT_ORIGIN?.replace(/\/$/, '')}/login?error=linkedin_failed` }),
  (req, res) => {
    const { code } = req.user
    return res.redirect(`${process.env.CLIENT_ORIGIN?.replace(/\/$/, '')}/auth/callback?code=${code}&provider=linkedin`)
  }
)

// ── CODE EXCHANGE ─────────────────────────────────────────────────────────────
router.post("/oauth/exchange", async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required." })
    }

    const oauthCode = await OAuthCode.findOne({ code }).populate("user")
    if (!oauthCode) {
      return res.status(400).json({ success: false, message: "Invalid or expired code." })
    }
    if (oauthCode.expiresAt < new Date()) {
      await OAuthCode.deleteOne({ _id: oauthCode._id })
      return res.status(400).json({ success: false, message: "Code has expired. Please try again." })
    }

    const user = oauthCode.user
    await OAuthCode.deleteOne({ _id: oauthCode._id })

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    )

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   30 * 24 * 60 * 60 * 1000,
    })

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        role:            user.role,
        avatar:          user.avatar,
        membershipPlan:  user.membershipPlan,
        isEmailVerified: user.isEmailVerified,
        isApproved:      user.isApproved,
        googleId:        user.googleId,
        linkedinId:      user.linkedinId,
        createdAt:       user.createdAt,
      },
    })
  } catch (error) {
    console.error("OAuth exchange error:", error)
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
})

module.exports = router;