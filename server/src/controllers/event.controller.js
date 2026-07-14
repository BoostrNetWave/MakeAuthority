const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const QRCode = require("qrcode");

// ─── CREATE EVENT ──────────────────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user._id,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE EVENT ──────────────────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE EVENT ──────────────────────────────────────
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    await EventRegistration.deleteMany({ event: req.params.id }); // cascade delete registrations

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL EVENTS (WITH FILTERS) ──────────────────────
exports.getEvents = async (req, res) => {
  try {
    const { type, format, search, status } = req.query;
    
    let query = { status: status || "Published", isPublic: true };
    
    if (type) query.type = type;
    if (format) query.format = format;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Only show future events by default unless specified
    if (!req.query.showPast) {
      query.startDateTime = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate("organizer", "name avatar")
      .sort({ startDateTime: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET EVENT DETAILS ──────────────────────────────────
exports.getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name avatar bio");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    let registration = null;
    if (req.user) {
      registration = await EventRegistration.findOne({ event: event._id, user: req.user._id });
    }

    // Get current registered count
    const registeredCount = await EventRegistration.countDocuments({ event: event._id, status: "Registered" });

    res.status(200).json({ 
      success: true, 
      event, 
      registration,
      registeredCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REGISTER FOR EVENT (OR WAITLIST) ───────────────────
exports.registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Organizers cannot register for their own event" });
    }

    if (event.status !== "Published") {
      return res.status(400).json({ success: false, message: "Event is not open for registration" });
    }

    // Check deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }

    let status = "Registered";
    let qrCodeImage = null;

    // Check capacity & Waitlist logic
    if (event.capacity > 0) {
      const registeredCount = await EventRegistration.countDocuments({ event: event._id, status: "Registered" });
      if (registeredCount >= event.capacity) {
        status = "Waitlisted";
      }
    }

    // Generate QR Code only if Registered
    if (status === "Registered") {
      const qrData = JSON.stringify({ eventId: event._id, userId: req.user._id });
      qrCodeImage = await QRCode.toDataURL(qrData);
    }

    const registration = await EventRegistration.create({
      event: event._id,
      user: req.user._id,
      qrCode: qrCodeImage,
      status
    });

    const message = status === "Waitlisted" ? "You have been added to the waitlist" : "Successfully registered";
    res.status(201).json({ success: true, message, registration });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You are already registered or waitlisted for this event" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CANCEL REGISTRATION & AUTO-PROMOTE ─────────────────
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await EventRegistration.findOne({ event: req.params.id, user: req.user._id });
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const wasRegistered = registration.status === "Registered";
    
    registration.status = "Cancelled";
    registration.qrCode = null; // revoke QR
    await registration.save();

    // AUTO-PROMOTE Waitlist
    if (wasRegistered) {
      const event = await Event.findById(req.params.id);
      if (event.capacity > 0) {
        // Find oldest waitlisted user
        const nextInLine = await EventRegistration.findOne({ event: req.params.id, status: "Waitlisted" }).sort({ registeredAt: 1 });
        if (nextInLine) {
          nextInLine.status = "Registered";
          const qrData = JSON.stringify({ eventId: event._id, userId: nextInLine.user });
          nextInLine.qrCode = await QRCode.toDataURL(qrData);
          await nextInLine.save();
          // Ideally send email/notification here
        }
      }
    }

    res.status(200).json({ success: true, message: "Registration cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CHECK IN (MARK ATTENDANCE) ─────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const { userId } = req.body; // Scanned from QR code
    const eventId = req.params.id;

    // Verify user is organizer
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Not authorized to check-in attendees" });
    }

    const registration = await EventRegistration.findOne({ event: eventId, user: userId });
    if (!registration) {
      return res.status(404).json({ success: false, message: "User is not registered for this event" });
    }

    if (registration.status !== "Registered") {
      return res.status(400).json({ success: false, message: `Cannot check in user with status: ${registration.status}` });
    }

    if (registration.attended) {
      return res.status(400).json({ success: false, message: "User is already checked in" });
    }

    registration.attended = true;
    registration.checkInTime = new Date();
    await registration.save();

    res.status(200).json({ success: true, message: "Checked in successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET MY EVENTS (USER) ───────────────────────────────
exports.getMyEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate("event")
      .sort({ registeredAt: -1 });
    
    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ORGANIZER EVENTS ───────────────────────────────
exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ startDateTime: -1 });
    
    // Attach registration counts for dashboard stats
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const regCount = await EventRegistration.countDocuments({ event: event._id, status: "Registered" });
      const attCount = await EventRegistration.countDocuments({ event: event._id, attended: true });
      return {
        ...event._doc,
        stats: { registered: regCount, attended: attCount }
      };
    }));

    res.status(200).json({ success: true, count: eventsWithStats.length, events: eventsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── EXPORT CALENDAR (ICS) ──────────────────────────────
exports.exportICS = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send("Event not found");

    const formatDate = (date) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Boostr Ecosystem//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event._id}@boostr.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDateTime)}`,
      `DTEND:${formatDate(event.endDateTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.format === 'Online' ? event.meetingLink : event.location || 'TBA'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics"`);
    res.status(200).send(icsData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
