const { Router } = require("express");
const { getMatchedInvestors, getMatchedStartups } = require("../controllers/matchmaking.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

// GET /api/matchmaking/investors -> Founder matchmaking with Investors
router.get("/investors", protect, authorizeRoles("founder"), getMatchedInvestors);

// GET /api/matchmaking/startups -> Investor matchmaking with Startups
router.get("/startups", protect, authorizeRoles("investor"), getMatchedStartups);

module.exports = router;
