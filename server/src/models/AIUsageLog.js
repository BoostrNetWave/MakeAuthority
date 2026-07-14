const mongoose = require("mongoose");

// Tracks AI usage per user for rate limiting + analytics
const aiUsageLogSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    function:   { type: String, required: true }, // e.g. "grant_recommendations"
    tokensUsed: { type: Number, default: 0 },
    cost:       { type: Number, default: 0 },     // in USD cents
    success:    { type: Boolean, default: true },
    createdAt:  { type: Date, default: Date.now },
  },
  { timestamps: false }
);

aiUsageLogSchema.index({ user: 1, createdAt: -1 });

const AIUsageLog = mongoose.model("AIUsageLog", aiUsageLogSchema);
module.exports = AIUsageLog;
