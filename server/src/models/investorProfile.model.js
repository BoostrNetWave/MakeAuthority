const mongoose = require("mongoose");

const portfolioCompanySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  website:   { type: String, default: null },
  stage:     { type: String, default: null },
  year:      { type: Number, default: null },
  amount:    { type: Number, default: null }, 
  exitStatus:{ type: String, enum: ["active", "exited", "failed"], default: "active" },
});

const investorProfileSchema = new mongoose.Schema(
  {
    // ── LINK TO USER ────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── IDENTITY ─────────────────────────────────────
    firmName:    { type: String, default: null },
    designation: { type: String, default: null }, // Partner, Angel, MD
    avatar:      { type: String, default: null },
    bio:         { type: String, maxlength: 1000, default: null },

    // ── INVESTOR TYPE ────────────────────────────────
    investorType: {
      type: String,
      enum: [
        "angel", "venture_capital", "family_office",
        "corporate_vc", "micro_vc", "hni", "accelerator",
      ],
      required: true,
    },

    // ── INVESTMENT PREFERENCES ───────────────────────
    investmentStages: {
      type: [String],
      enum: ["idea", "pre_seed", "seed", "series_a", "series_b", "series_c", "growth"],
      default: [],
    },
    industriesOfInterest: {
      type: [String],
      enum: [
        "fintech", "healthtech", "edtech", "agritech",
        "saas", "ecommerce", "logistics", "cleantech",
        "deeptech", "gaming", "media", "legaltech",
        "hrtech", "proptech", "foodtech", "other",
      ],
      default: [],
    },
    geographicPreference: {
      type: [String],
      default: ["India"],
    },

    // ── TICKET SIZE (INR) ────────────────────────────
    ticketSizeMin: { type: Number, default: null },
    ticketSizeMax: { type: Number, default: null },

    // ── PORTFOLIO ────────────────────────────────────
    portfolioCompanies: [portfolioCompanySchema],
    totalInvestments:   { type: Number, default: 0 },
    totalPortfolioValue:{ type: Number, default: 0 }, // from CASParser

    // ── CASPARSER VERIFICATION ───────────────────────
    casVerified: {
      type: Boolean,
      default: false,
    },
    casData: {
      // Raw summary from CASParser API
      totalValue:    { type: Number, default: null },
      mutualFunds:   { type: Number, default: null }, // count
      dematAccounts: { type: Number, default: null }, // count
      parsedAt:      { type: Date,   default: null },
    },
    investorStrengthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── ONLINE PRESENCE ──────────────────────────────
    linkedin:  { type: String, default: null },
    website:   { type: String, default: null },
    twitter:   { type: String, default: null },

    // ── LOCATION ─────────────────────────────────────
    city:    { type: String, default: null },
    state:   { type: String, default: null },
    country: { type: String, default: "India" },

    // ── SAVED STARTUPS ───────────────────────────────
    savedStartups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FounderProfile",
      },
    ],

    // ── ADMIN ────────────────────────────────────────
    isVerifiedByAdmin: { type: Boolean, default: false },
    verifiedAt:        { type: Date, default: null },

    // ── STATS ────────────────────────────────────────
    profileViews:  { type: Number, default: 0 },
    completionScore:{ type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
);

// ── CALCULATE INVESTOR STRENGTH SCORE ────────────────
// Based on CASParser data + profile completeness
investorProfileSchema.methods.calculateStrengthScore = function () {
  let score = 0;
  if (this.casVerified)                    score += 40; // verified portfolio
  if (this.portfolioCompanies.length > 0)  score += 20; // has portfolio
  if (this.portfolioCompanies.length > 5)  score += 10; // active investor
  if (this.bio)                            score += 10; // has bio
  if (this.linkedin)                       score += 10; // has linkedin
  if (this.industriesOfInterest.length > 0)score += 10; // has preferences
  this.investorStrengthScore = Math.min(score, 100);
  return this.investorStrengthScore;
};

const InvestorProfile = mongoose.model("InvestorProfile", investorProfileSchema);
module.exports = InvestorProfile;