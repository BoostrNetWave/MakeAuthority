const { Router } = require("express");
const {
  getStats,
  getPendingStartups,
  getPendingInvestors,
  getPendingIncubators,
  getPendingServiceProviders,
  approveUser,
  getAllUsers,
  deactivateUser,
} = require("../controllers/admin.controller");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router();

const adminOnly = [protect, authorizeRoles("super_admin")];

router.get(   "/stats",                    ...adminOnly, getStats);
router.get(   "/pending-startups",         ...adminOnly, getPendingStartups);
router.get(   "/pending-investors",        ...adminOnly, getPendingInvestors);
router.get(   "/pending-incubators",       ...adminOnly, getPendingIncubators);
router.get(   "/pending-service-providers",...adminOnly, getPendingServiceProviders);
router.patch( "/users/:id/approve",        ...adminOnly, approveUser);
router.get(   "/users",                    ...adminOnly, getAllUsers);
router.patch( "/users/:id/deactivate",     ...adminOnly, deactivateUser);

module.exports = router;

