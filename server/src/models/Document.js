const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema({
  url:         { type: String, required: true },
  uploadedAt:  { type: Date, default: Date.now },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  size:        { type: Number, default: 0 }, // bytes
  note:        { type: String, default: null },
});

const documentSchema = new mongoose.Schema(
  {
    // ── OWNERSHIP ─────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── FILE INFO ─────────────────────────────────────
    name: {
      type: String,
      required: [true, "Document name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
      default: null,
    },
    fileUrl: {
      type: String,
      required: true, // Cloudinary URL
    },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "image", "other"],
      default: "pdf",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: null,
    },

    // ── FOLDER (PRD exact categories) ─────────────────
    folder: {
      type: String,
      enum: [
        "pitch_decks",
        "business_plans",
        "financial_statements",
        "legal_documents",
        "cap_tables",
        "company_certificates",
        "other",
      ],
      required: true,
    },

    // ── VERSION HISTORY ───────────────────────────────
    versions: [documentVersionSchema],
    currentVersion: {
      type: Number,
      default: 1,
    },

    // ── ACCESS CONTROL ────────────────────────────────
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        user:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        permission: { type: String, enum: ["view", "download"], default: "view" },
        sharedAt:   { type: Date, default: Date.now },
      },
    ],
    shareLink: {
      type: String,
      default: null, // public share link token
    },
    shareLinkExpiry: {
      type: Date,
      default: null,
    },

    // ── SOFT DELETE ───────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, folder: 1, isDeleted: 1 });
documentSchema.index({ shareLink: 1 });

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
