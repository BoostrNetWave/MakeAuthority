const { Router } = require("express");
const {
  createFounderProfile,
  getMyFounderProfile,
  updateFounderProfile,
  getFounderProfileBySlug,
  createInvestorProfile,
  getMyInvestorProfile,
  updateInvestorProfile,
} = require("../controllers/profile.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── FOUNDER ROUTES ────────────────────────────────────
router.post(  "/founder",      protect, authorizeRoles("founder"), createFounderProfile);
router.get(   "/founder/me",   protect, authorizeRoles("founder"), getMyFounderProfile);
router.put(   "/founder/me",   protect, authorizeRoles("founder"), updateFounderProfile);
router.get(   "/founder/:slug",                                    getFounderProfileBySlug); // public

// ── INVESTOR ROUTES ───────────────────────────────────
router.post(  "/investor",     protect, authorizeRoles("investor"), createInvestorProfile);
router.get(   "/investor/me",  protect, authorizeRoles("investor"), getMyInvestorProfile);
router.put(   "/investor/me",  protect, authorizeRoles("investor"), updateInvestorProfile);

module.exports = router;