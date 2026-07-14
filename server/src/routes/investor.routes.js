const { Router } = require("express");
const {
  getAllInvestors,
  getInvestorById,
  saveInvestor,
  adminGetAllInvestors,
  approveInvestor,
} = require("../controllers/investor.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── PUBLIC ─────────────────────────────────────────────
router.get("/",          getAllInvestors);
router.get("/:id",       getInvestorById);

// ── FOUNDER ONLY ───────────────────────────────────────
router.post("/:id/save", protect, authorizeRoles("founder"), saveInvestor);

// ── ADMIN ONLY ─────────────────────────────────────────
router.get(   "/admin/all",   protect, authorizeRoles("super_admin"), adminGetAllInvestors);
router.patch( "/:id/approve", protect, authorizeRoles("super_admin"), approveInvestor);

module.exports = router;