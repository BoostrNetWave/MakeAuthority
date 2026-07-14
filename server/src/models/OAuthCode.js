const mongoose = require("mongoose");

// Short-lived one-time codes for OAuth token exchange
// Safer than passing JWT in URL query string
const oauthCodeSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
})

const OAuthCode = mongoose.model("OAuthCode", oauthCodeSchema)
module.exports = OAuthCode
