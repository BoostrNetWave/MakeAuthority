const { Router } = require("express");
const {
  getAllIncubators,
  getIncubatorBySlug,
  createIncubatorProfile,
  updateIncubatorProfile,
  getMyIncubatorProfile,
  applyToIncubator,
  getMyApplications,
  adminCreateIncubator,
  verifyIncubator,
} = require("../controllers/incubator.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── PUBLIC ─────────────────────────────────────────────
router.get("/",          getAllIncubators);

// ── INCUBATOR USER ─────────────────────────────────────
router.post(  "/profile/me", protect, authorizeRoles("incubator"), createIncubatorProfile);
router.get(   "/profile/me", protect, authorizeRoles("incubator"), getMyIncubatorProfile);
router.put(   "/profile/me", protect, authorizeRoles("incubator"), updateIncubatorProfile);
router.get(   "/applications", protect, authorizeRoles("incubator"), getMyApplications);

// ── FOUNDER ────────────────────────────────────────────
router.post("/:id/apply", protect, authorizeRoles("founder"), applyToIncubator);

// ── ADMIN ──────────────────────────────────────────────
router.post(  "/admin/create",      protect, authorizeRoles("super_admin"), adminCreateIncubator);
router.patch( "/:id/verify",        protect, authorizeRoles("super_admin"), verifyIncubator);

router.get("/:slug",     getIncubatorBySlug);

module.exports = router;