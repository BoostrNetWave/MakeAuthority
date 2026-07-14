const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCode: {
      type: String, // Base64 string of the QR code image
    },
    attended: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Registered", "Cancelled", "Waitlisted"],
      default: "Registered",
    },
    feedbackSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
