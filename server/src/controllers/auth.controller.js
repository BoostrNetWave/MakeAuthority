const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const APPROVAL_REQUIRED_ROLES = ["investor", "incubator", "service_provider"];

const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,
    accessToken,
    user: user.toSafeObject(),
  });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;

    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot self-register as super_admin.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    const user = await User.create({ name, email, password, role });

    if (['investor', 'incubator', 'service_provider'].includes(user.role)) {
      return res.status(201).json({
        success: true,
        message: "Account created. Awaiting admin approval before you can log in.",
        user: user.toSafeObject(),
      });
    }

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!user.isApproved && APPROVAL_REQUIRED_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval. You will be notified once approved.",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token found. Please log in." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Refresh token expired or invalid. Please log in again.",
      });
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken: token }).select("+refreshToken");

    if (!user) {
      return res.status(403).json({ success: false, message: "Refresh token revoked. Please log in again." });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getMe = (req, res) => {
  return res.status(200).json({ success: true, user: req.user.toSafeObject() });
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, linkedinId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (linkedinId !== undefined) user.linkedinId = linkedinId;

    await user.save();

    return res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// PATCH /api/auth/me — update name
const updateMe = async (req, res) => {
  try {
    const { name } = req.body
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." })
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { returnDocument: 'after' }
    ).select('-password')
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}

// PATCH /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both fields required." })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." })
    }
    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." })
    }
    user.password = newPassword
    await user.save()
    return res.status(200).json({ success: true, message: "Password changed successfully." })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}

// PATCH /api/auth/notification-preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { returnDocument: 'after' }
    ).select('-password')
    return res.status(200).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}

// DELETE /api/auth/me — delete account
const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false, isDeleted: true })
    return res.status(200).json({ success: true, message: "Account deleted." })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  updateMe,
  changePassword,
  updateNotificationPreferences,
  deleteMe
};