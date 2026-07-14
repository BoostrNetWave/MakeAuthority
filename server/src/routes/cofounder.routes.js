const { Router } = require("express");
const {
  createCoFounderProfile,
  getMyCoFounderProfile,
  updateCoFounderProfile,
  getCoFounderMatches,
  sendConnectionRequest,
  getAllCoFounders,
} = require("../controllers/cofounder.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// ── PUBLIC ──────────────────────────────────────────────
router.get("/", getAllCoFounders);

// ── AUTHENTICATED (any role) ────────────────────────────
router.post(  "/profile",     protect, createCoFounderProfile);
router.get(   "/profile/me",  protect, getMyCoFounderProfile);
router.put(   "/profile/me",  protect, updateCoFounderProfile);
router.get(   "/matches",     protect, getCoFounderMatches);
router.post(  "/connect/:id", protect, sendConnectionRequest);

module.exports = router;