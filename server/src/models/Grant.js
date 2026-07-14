const mongoose = require("mongoose");

const grantSchema = new mongoose.Schema(
  {
    // ── BASICS ───────────────────────────────────────
    grantName: {
      type: String,
      required: [true, "Grant name is required"],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    organization: {
      type: String, // e.g. "DPIIT", "BIRAC", "Tata Trusts"
      required: true,
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
      default: null,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // ── CATEGORY ─────────────────────────────────────
    category: {
      type: String,
      enum: [
        "government",
        "csr",
        "women_founder",
        "technology",
        "startup",
        "research",
      ],
      required: true,
    },

    // ── FUNDING DETAILS ──────────────────────────────
    fundingAmountMin: { type: Number, default: null }, // INR
    fundingAmountMax: { type: Number, default: null }, // INR
    equityRequired:   { type: Boolean, default: false },
    equityPercentage: { type: Number, default: null },

    // ── ELIGIBILITY ──────────────────────────────────
    eligibility: {
      type: String,
      required: true,
      maxlength: 1500,
    },
    eligibleIndustries: {
      type: [String],
      enum: [
        "fintech", "healthtech", "edtech", "agritech",
        "saas", "ecommerce", "logistics", "cleantech",
        "deeptech", "gaming", "media", "legaltech",
        "hrtech", "proptech", "foodtech", "other", "all",
      ],
      default: ["all"],
    },
    eligibleStages: {
      type: [String],
      enum: ["idea", "pre_seed", "seed", "series_a", "series_b", "growth"],
      default: [],
    },
    womenFoundersOnly: { type: Boolean, default: false },

    // ── APPLICATION ──────────────────────────────────
    applicationProcess: {
      type: String,
      maxlength: 2000,
      default: null,
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    officialWebsite: {
      type: String,
      default: null,
    },
    applyUrl: {
      type: String, // direct application link
      default: null,
    },

    // ── DEADLINE ─────────────────────────────────────
    deadline: {
      type: Date,
      default: null, // null = rolling/no deadline
    },
    isRollingDeadline: {
      type: Boolean,
      default: false,
    },

    // ── STATUS ───────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate expired grants
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── STATS ────────────────────────────────────────
    viewCount:     { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    applyClickCount:{ type: Number, default: 0 },

    // ── CREATED BY (admin) ───────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── AUTO SLUG ─────────────────────────────────────────
grantSchema.pre("save", async function () {
  if (this.isModified("grantName") && this.grantName) {
    this.slug = this.grantName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
      "-" + Date.now().toString().slice(-4);
  }
});

// ── VIRTUAL — is deadline approaching (within 7 days) ──
grantSchema.methods.isDeadlineApproaching = function () {
  if (!this.deadline || this.isRollingDeadline) return false;
  const daysLeft = (this.deadline - new Date()) / (1000 * 60 * 60 * 24);
  return daysLeft > 0 && daysLeft <= 7;
};

// ── VIRTUAL — is expired ────────────────────────────────
grantSchema.methods.isExpired = function () {
  if (!this.deadline || this.isRollingDeadline) return false;
  return this.deadline < new Date();
};

const Grant = mongoose.model("Grant", grantSchema);
module.exports = Grant;