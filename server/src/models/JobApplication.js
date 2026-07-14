const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    // ── WHO APPLIED ───────────────────────────────────
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── WHICH JOB ─────────────────────────────────────
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // ── APPLICATION DATA ──────────────────────────────
    resumeUrl: {
      type: String,
      default: null, // Cloudinary URL
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
      default: null,
    },
    portfolioUrl: {
      type: String,
      default: null,
    },
    linkedinUrl: {
      type: String,
      default: null,
    },

    // ── STATUS PIPELINE ───────────────────────────────
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "accepted",
        "rejected",
      ],
      default: "submitted",
    },

    // ── INTERVIEW DETAILS ─────────────────────────────
    interviewDate: {
      type: Date,
      default: null,
    },
    interviewNotes: {
      type: String,
      default: null,
    },

    // ── FOUNDER NOTES (visible only to job poster) ───
    founderNotes: {
      type: String,
      default: null,
    },

    // ── STATUS HISTORY ────────────────────────────────
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate applications
jobApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

// Auto track status changes
jobApplicationSchema.pre("save", async function () {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status:    this.status,
      changedAt: new Date(),
    });
  }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
module.exports = JobApplication;
