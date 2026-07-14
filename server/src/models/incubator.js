const mongoose = require("mongoose");

const incubatorSchema = new mongoose.Schema(
  {
    // ── LINK TO USER ─────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── ORGANIZATION BASICS ──────────────────────────
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: null,
    },
    tagline: {
      type: String,
      maxlength: 160,
      default: null,
    },

    // ── PROGRAM DETAILS ──────────────────────────────
    programName: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "iit_incubator",
        "iim_incubator",
        "university_incubator",
        "government_incubator",
        "corporate_accelerator",
        "private_accelerator",
      ],
      required: true,
    },
    fundingOffered: {
      type: Number, // INR
      default: null,
    },
    equityRequired: {
      type: Boolean,
      default: false,
    },
    equityPercentage: {
      type: Number,
      default: null,
    },
    duration: {
      type: String, // e.g. "6 months", "1 year"
      default: null,
    },

    // ── BENEFITS ─────────────────────────────────────
    benefits: {
      type: [String],
      default: [],
    },

    // ── ELIGIBILITY ──────────────────────────────────
    eligibility: {
      type: String,
      maxlength: 1500,
      default: null,
    },
    eligibleIndustries: {
      type: [String],
      default: ["all"],
    },
    eligibleStages: {
      type: [String],
      enum: ["idea", "pre_seed", "seed", "series_a", "growth"],
      default: [],
    },

    // ── LOCATION ─────────────────────────────────────
    city:    { type: String, default: null },
    state:   { type: String, default: null },
    country: { type: String, default: "India" },

    // ── APPLICATION ──────────────────────────────────
    applicationProcess: {
      type: String,
      default: null,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    isRollingAdmission: {
      type: Boolean,
      default: false,
    },
    applyUrl: {
      type: String,
      default: null,
    },

    // ── ONLINE PRESENCE ──────────────────────────────
    website:  { type: String, default: null },
    linkedin: { type: String, default: null },
    twitter:  { type: String, default: null },

    // ── STATUS ───────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // ── STATS ────────────────────────────────────────
    viewCount:      { type: Number, default: 0 },
    applicationCount:{ type: Number, default: 0 },
    cohortCount:    { type: Number, default: 0 },
    alumniCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── AUTO SLUG ─────────────────────────────────────────
incubatorSchema.pre("save", async function () {
  if (this.isModified("organizationName") && this.organizationName) {
    this.slug = this.organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
      "-" + Date.now().toString().slice(-4);
  }
});

const Incubator = mongoose.models.Incubator || mongoose.model("Incubator", incubatorSchema);
module.exports = Incubator;