const passport       = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy
const crypto         = require("crypto")
const User           = require("../models/User")
const OAuthCode      = require("../models/OAuthCode")

// ── HELPER — generate secure one-time code ─────────────────────────────────
const generateOAuthCode = async (userId) => {
  const code = crypto.randomBytes(32).toString("hex")
  await OAuthCode.create({
    code,
    user:      userId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  })
  return code
}

// ── HELPER — find or create user from OAuth profile ────────────────────────
const findOrCreateUser = async ({ email, name, avatar, googleId, linkedinId }) => {
  // Step 1: try to find by OAuth ID first
  let user = null
  if (googleId)   user = await User.findOne({ googleId })
  if (linkedinId) user = await User.findOne({ linkedinId })

  // Step 2: try to find by email (existing account — merge)
  if (!user && email) {
    user = await User.findOne({ email })
    if (user) {
      // Merge OAuth identity into existing account
      if (googleId   && !user.googleId)   user.googleId   = googleId
      if (linkedinId && !user.linkedinId) user.linkedinId = linkedinId
      if (!user.avatar && avatar)         user.avatar     = avatar
      user.isEmailVerified = true // OAuth email is verified by provider
      await user.save()
    }
  }

  // Step 3: create new user if not found
  if (!user) {
    user = await User.create({
      name,
      email,
      avatar:          avatar || null,
      googleId:        googleId   || null,
      linkedinId:      linkedinId || null,
      role:            "founder", // default role — can be changed in onboarding
      isApproved:      true,      // OAuth users skip manual approval
      isEmailVerified: true,      // Provider verified the email
      membershipPlan:  "free",
    })
  }

  return user
}

// ── GOOGLE STRATEGY ────────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.SERVER_ORIGIN}/api/auth/google/callback`,
    scope:        ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value
      const name   = profile.displayName
      const avatar = profile.photos?.[0]?.value

      if (!email) {
        return done(new Error("No email returned from Google"), null)
      }

      const user = await findOrCreateUser({
        email, name, avatar,
        googleId: profile.id,
      })

      // Generate one-time code for secure frontend exchange
      const code = await generateOAuthCode(user._id)
      return done(null, { user, code })
    } catch (error) {
      console.error("Google OAuth error:", error)
      return done(error, null)
    }
  }
))

// ── LINKEDIN STRATEGY ──────────────────────────────────────────────────────
passport.use(new LinkedInStrategy(
  {
    clientID:     process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL:  `${process.env.SERVER_ORIGIN}/api/auth/linkedin/callback`,
    scope:        ["r_emailaddress", "r_liteprofile"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value
      const name   = profile.displayName
      const avatar = profile.photos?.[0]?.value

      if (!email) {
        return done(new Error("No email returned from LinkedIn"), null)
      }

      const user = await findOrCreateUser({
        email, name, avatar,
        linkedinId: profile.id,
      })

      const code = await generateOAuthCode(user._id)
      return done(null, { user, code })
    } catch (error) {
      console.error("LinkedIn OAuth error:", error)
      return done(error, null)
    }
  }
))

// Passport requires these — not used for JWT but needed to initialize
passport.serializeUser((data, done)   => done(null, data))
passport.deserializeUser((data, done) => done(null, data))

module.exports = passport
