const mongoose = require("mongoose");

const grantBookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grant",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks
grantBookmarkSchema.index({ user: 1, grant: 1 }, { unique: true });

const GrantBookmark = mongoose.model("GrantBookmark", grantBookmarkSchema);
module.exports = GrantBookmark;