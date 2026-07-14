const { Router } = require("express");
const {
  createService,
  getServices,
  getServiceById,
  addReview,
  submitProposal,
  getMyProposals,
  updateProposalStatus,
} = require("../controllers/service.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);

// Protected routes (Providers)
router.post(
  "/",
  protect,
  authorizeRoles("service_provider"),
  createService
);
router.put(
  "/proposals/:id",
  protect,
  authorizeRoles("service_provider"),
  updateProposalStatus
);

// Protected routes (Founders + Providers for getting proposals)
// Need to put /proposals/me ABOVE /:id/proposals to avoid route conflict
router.get("/proposals/me", protect, getMyProposals);

// Protected routes (Founders submitting proposals/reviews)
router.post("/:id/proposals", protect, authorizeRoles("founder"), submitProposal);
router.post("/:id/reviews", protect, authorizeRoles("founder"), addReview);

module.exports = router;
