const { Router } = require("express");
const {
  getAllGrants,
  getGrantBySlug,
  checkEligibility,
  toggleBookmark,
  getMyBookmarks,
  createGrant,
  updateGrant,
  deleteGrant,
} = require("../controllers/grant.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── PUBLIC ─────────────────────────────────────────────
router.get("/",      getAllGrants);
router.get("/:slug", getGrantBySlug);

// ── FOUNDER ONLY ───────────────────────────────────────
router.get(  "/bookmarks/me",            protect, authorizeRoles("founder"), getMyBookmarks);
router.post( "/:id/bookmark",            protect, authorizeRoles("founder"), toggleBookmark);
router.post( "/:slug/check-eligibility", protect, authorizeRoles("founder"), checkEligibility);

// ── ADMIN ONLY ─────────────────────────────────────────
router.post(   "/",     protect, authorizeRoles("super_admin"), createGrant);
router.put(    "/:id",  protect, authorizeRoles("super_admin"), updateGrant);
router.delete( "/:id",  protect, authorizeRoles("super_admin"), deleteGrant);

module.exports = router;