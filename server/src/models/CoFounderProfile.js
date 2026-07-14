const mongoose = require("mongoose");

const coFounderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── WHO THEY ARE ──────────────────────────────────
    currentRole: {
      type: String,
      enum: ["technical", "business", "marketing", "design", "operations", "finance", "legal", "other"],
      required: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 40,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    linkedinUrl: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },

    // ── WHAT THEY WANT ────────────────────────────────
    lookingForRole: {
      type: String,
      enum: ["technical", "business", "marketing", "design", "operations", "finance", "legal", "other"],
      required: true,
    },
    industryInterests: {
      type: [String],
      enum: [
        "fintech", "healthtech", "edtech", "agritech",
        "saas", "ecommerce", "logistics", "cleantech",
        "deeptech", "gaming", "media", "legaltech",
        "hrtech", "proptech", "foodtech", "other",
      ],
      default: [],
    },

    // ── LOCATION ─────────────────────────────────────
    city:    { type: String, default: null },
    state:   { type: String, default: null },
    country: { type: String, default: "India" },

    // ── STATUS ────────────────────────────────────────
    status: {
      type: String,
      enum: ["actively_looking", "open_to_ideas", "not_looking"],
      default: "actively_looking",
    },

    // ── CONNECTIONS ───────────────────────────────────
    connections: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status:    { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── STATS ─────────────────────────────────────────
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CoFounderProfile = mongoose.model("CoFounderProfile", coFounderProfileSchema);
module.exports = CoFounderProfile;