const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // ── CONTENT ───────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      maxlength: [10000, "Post cannot exceed 10,000 characters"],
    },
    coverImage: {
      type: String,
      default: null,
    },

    // ── AUTHOR ────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── CATEGORIZATION ────────────────────────────────
    category: {
      type: String,
      enum: [
        "founder_discussion",
        "qa",
        "industry",
        "mentor",
        "knowledge",
      ],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: v => v.length <= 5,
        message: "Maximum 5 tags allowed",
      },
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
    commentCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },

    // ── MODERATION ────────────────────────────────────
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
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

// ── INDEXES for fast queries ───────────────────────────
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ upvoteCount: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });
postSchema.index({
  title: "text",
  body:  "text",
  tags:  "text",
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;