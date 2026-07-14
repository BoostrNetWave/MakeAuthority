const { Router } = require("express");
const {
  getAllStartups,
  getStartupBySlug,
  adminGetAllStartups,
  approveStartup,
  rejectStartup,
  toggleStartupBookmark,
  getMySavedStartups,
} = require("../controllers/startup.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── PUBLIC (no auth) ────────────────────────────────────────
router.get("/",          getAllStartups);     // list + filter

// ── AUTH (any logged-in user) ────────────────────────────────
router.get(  "/saved/me", protect, getMySavedStartups);    // my saved startups
router.post( "/:id/save", protect, toggleStartupBookmark); // toggle save

// ── ADMIN ONLY ───────────────────────────────────────────────
router.get(   "/admin/all",   protect, authorizeRoles("super_admin"), adminGetAllStartups);
router.patch( "/:id/approve", protect, authorizeRoles("super_admin"), approveStartup);
router.patch( "/:id/reject",  protect, authorizeRoles("super_admin"), rejectStartup);

// ── PUBLIC slug (must be LAST to avoid catching /saved/me etc) ─
router.get("/:slug", getStartupBySlug);

module.exports = router;