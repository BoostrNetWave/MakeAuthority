const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ── WHO IS APPLYING ──────────────────────────────
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FounderProfile",
      required: true,
    },

    // ── WHAT THEY'RE APPLYING TO ─────────────────────
    targetType: {
      type: String,
      enum: ["grant", "investor", "incubator", "external"],
      required: true,
    },
    grant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grant",
      default: null,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestorProfile",
      default: null,
    },
    incubator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incubator",
      default: null,
    },
    
    // ── EXTERNAL LEADS (CRM) ─────────────────────────
    isExternal: {
      type: Boolean,
      default: false,
    },
    externalName: {
      type: String,
      default: null,
    },
    externalOrg: {
      type: String,
      default: null,
    },

    // ── STATUS PIPELINE ──────────────────────────────
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "accepted", "rejected", "funded"],
      default: "draft",
    },

    // ── MEETING TRACKING ─────────────────────────────
    meetingStatus: {
      type: String,
      enum: ["none", "requested", "scheduled", "completed"],
      default: "none",
    },
    meetingDate: {
      type: Date,
      default: null,
    },

    // ── NOTES + HISTORY ──────────────────────────────
    notes: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // ── FUNDED AMOUNT ────────────────────────────────
    fundedAmount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto track every status change
applicationSchema.pre("save", async function () {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status:    this.status,
      changedAt: new Date(),
    });
  }
});

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;