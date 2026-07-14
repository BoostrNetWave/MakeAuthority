const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  role:       { type: String, required: true },
  linkedin:   { type: String, default: null },
  avatar:     { type: String, default: null },
});

const founderProfileSchema = new mongoose.Schema(
  {
    // ── LINK TO USER ────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per founder
    },

    // ── STARTUP BASICS ───────────────────────────────
    startupName: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
      maxlength: [100, "Startup name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: null, // Cloudinary URL
    },
    tagline: {
      type: String,
      maxlength: [160, "Tagline cannot exceed 160 characters"],
      default: null,
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: null,
    },

    // ── INDUSTRY + CATEGORY ──────────────────────────
    industry: {
      type: String,
      enum: [
        "fintech", "healthtech", "edtech", "agritech",
        "saas", "ecommerce", "logistics", "cleantech",
        "deeptech", "gaming", "media", "legaltech",
        "hrtech", "proptech", "foodtech", "other",
      ],
      required: [true, "Industry is required"],
    },
    sector: {
      type: String,
      default: null,
    },

    // ── STAGE + REVENUE ──────────────────────────────
    fundingStage: {
      type: String,
      enum: ["idea", "pre_seed", "seed", "series_a", "series_b", "series_c", "growth", "profitable"],
      default: "idea",
    },
    revenueStage: {
      type: String,
      enum: ["pre_revenue", "early_revenue", "growing", "scaling", "profitable"],
      default: "pre_revenue",
    },
    fundingRequired: {
      type: Number, // in INR
      default: null,
    },
    fundingRaised: {
      type: Number, // total raised so far in INR
      default: 0,
    },

    // ── LOCATION ─────────────────────────────────────
    city:     { type: String, default: null },
    state:    { type: String, default: null },
    country:  { type: String, default: "India" },

    // ── ONLINE PRESENCE ──────────────────────────────
    website:  { type: String, default: null },
    linkedin: { type: String, default: null },
    twitter:  { type: String, default: null },
    instagram:{ type: String, default: null },

    // ── TEAM ─────────────────────────────────────────
    teamSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    teamMembers: [teamMemberSchema],

    // ── TECH ─────────────────────────────────────────
    techStack: {
      type: [String],
      default: [],
    },

    // ── MEDIA + DOCS (Cloudinary URLs) ───────────────
    pitchDeck:         { type: String, default: null },
    videoPitch:        { type: String, default: null }, // YouTube link
    productScreenshots:{ type: [String], default: [] },

    // ── ADMIN VERIFICATION ───────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },

    // ── PROFILE COMPLETION ───────────────────────────
    completionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── STATS (for matchmaking + search ranking) ─────
    profileViews:    { type: Number, default: 0 },
    investorViews:   { type: Number, default: 0 },
    bookmarkCount:   { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// ── AUTO GENERATE SLUG ───────────────────────────────
founderProfileSchema.pre("save", function () {
  if (this.isModified("startupName") && this.startupName) {
    this.slug = this.startupName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
      "-" + Date.now().toString().slice(-4);
  }
});

// ── AUTO CALCULATE COMPLETION SCORE ──────────────────
founderProfileSchema.methods.calculateCompletion = function () {
  const fields = [
    this.startupName,
    this.logo,
    this.tagline,
    this.description,
    this.industry,
    this.fundingStage,
    this.website,
    this.city,
    this.pitchDeck,
    this.teamMembers?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  this.completionScore = Math.round((filled / fields.length) * 100);
  return this.completionScore;
};

const FounderProfile = mongoose.model("FounderProfile", founderProfileSchema);
module.exports = FounderProfile;