const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: [
        "super_admin",
        "founder",
        "investor",
        "incubator",
        "service_provider",
        "job_seeker",
      ],
      default: "founder",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // investors + incubators require admin approval
    isApproved: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    linkedinId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    membershipPlan: {
      type: String,
      enum: ["free", "startup_pro", "investor_pro", "enterprise"],
      default: "free",
    },
    membershipExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    notificationPreferences: {
      emailGrantDeadlines: { type: Boolean, default: true },
      emailApplicationStatus: { type: Boolean, default: true },
      emailNewMatches: { type: Boolean, default: false },
      emailWeeklyDigest: { type: Boolean, default: true },
      inAppAll: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

userSchema.methods.hasPremiumAccess = function () {
  if (this.membershipPlan === "free") return false;
  if (!this.membershipExpires) return true;
  return this.membershipExpires > new Date();
};

const User = mongoose.model("User", userSchema);
module.exports = User;