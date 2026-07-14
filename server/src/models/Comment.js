const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // ── RELATIONSHIPS ─────────────────────────────────
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = top-level comment
    },

    // ── CONTENT ───────────────────────────────────────
    body: {
      type: String,
      required: [true, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    // ── ENGAGEMENT ────────────────────────────────────
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },

    // ── MODERATION ────────────────────────────────────
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

// ── INDEXES ────────────────────────────────────────────
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;