const { Router } = require("express");
const {
  createApplication,
  getMyApplications,
  getApplicationStats,
  updateApplication,
  reviewApplication,
  deleteApplication,
} = require("../controllers/application.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── FOUNDER routes ─────────────────────────────────────
router.post(   "/",           protect, authorizeRoles("founder"),                        createApplication);
router.get(    "/me",         protect, authorizeRoles("founder"),                        getMyApplications);
router.get(    "/stats",      protect, authorizeRoles("founder"),                        getApplicationStats);
router.put(    "/:id",        protect, authorizeRoles("founder"),                        updateApplication);
router.delete( "/:id",        protect, authorizeRoles("founder"),                        deleteApplication);

// ── INCUBATOR / INVESTOR review ────────────────────────
router.patch(  "/:id/review", protect, authorizeRoles("incubator", "investor"),          reviewApplication);

module.exports = router;