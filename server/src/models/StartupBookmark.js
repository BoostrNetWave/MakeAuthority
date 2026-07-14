const mongoose = require("mongoose");

const startupBookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FounderProfile",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks
startupBookmarkSchema.index({ user: 1, startup: 1 }, { unique: true });

const StartupBookmark = mongoose.model("StartupBookmark", startupBookmarkSchema);
module.exports = StartupBookmark;
