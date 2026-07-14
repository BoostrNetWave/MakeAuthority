const { Router } = require("express");
const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
  checkIfApplied,
} = require("../controllers/jobApplication.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── JOB SEEKER ──────────────────────────────────────────
router.post(   "/",              protect, applyToJob);
router.get(    "/me",            protect, getMyApplications);
router.get(    "/check/:jobId",  protect, checkIfApplied);
router.delete( "/:id",           protect, withdrawApplication);

// ── FOUNDER / ADMIN ─────────────────────────────────────
router.get(   "/job/:jobId",    protect, authorizeRoles("founder", "super_admin"), getJobApplicants);
router.patch( "/:id/status",    protect, authorizeRoles("founder", "super_admin"), updateApplicationStatus);

module.exports = router;
