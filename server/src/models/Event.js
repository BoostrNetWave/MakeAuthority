const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Webinar",
        "Workshop",
        "Demo Day",
        "Investor Meet",
        "Networking Mixer",
        "Hackathon",
        "Pitch Competition",
      ],
    },
    format: {
      type: String,
      required: true,
      enum: ["Online", "In-Person", "Hybrid"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    speakers: [
      {
        name: String,
        title: String,
        company: String,
        avatar: String,
      },
    ],
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String, // Physical address or description
    },
    meetingLink: {
      type: String, // Zoom, Meet, Luma link
    },
    capacity: {
      type: Number, // 0 means unlimited
      default: 0,
    },
    registrationDeadline: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Draft",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
