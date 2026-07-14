const { Router } = require("express");
const {
  createEvent,
  getEvents,
  getEventDetails,
  updateEvent,
  deleteEvent,
  registerEvent,
  cancelRegistration,
  checkIn,
  getMyEvents,
  getOrganizerEvents,
  exportICS
} = require("../controllers/event.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = Router();

// Public / Authenticated user reading routes
router.get("/", protect, getEvents);
router.get("/my-events", protect, getMyEvents); // Must be before /:id
router.get("/organizer", protect, authorizeRoles("super_admin", "incubator", "community_partner"), getOrganizerEvents);
router.get("/:id", protect, getEventDetails);
router.get("/:id/calendar.ics", protect, exportICS);

// Registration & Check-in
router.post("/:id/register", protect, registerEvent);
router.delete("/:id/register", protect, cancelRegistration);
router.post("/:id/checkin", protect, authorizeRoles("super_admin", "incubator", "community_partner"), checkIn);

// Organizer routes (Create, Update, Delete)
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "incubator", "community_partner"),
  createEvent
);
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "incubator", "community_partner"),
  updateEvent
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin", "incubator", "community_partner"),
  deleteEvent
);

module.exports = router;
