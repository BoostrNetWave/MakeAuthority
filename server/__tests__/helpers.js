const jwt  = require("jsonwebtoken")
const User = require("../src/models/User")

// Generate a real JWT for a test user
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "test_jwt_secret_boostr_2026",
    { expiresIn: "7d" }
  )
}

// Create a test user and return token
const createTestUser = async ({
  name  = "Test User",
  email,
  password    = "TestPass@123",
  role        = "founder",
  isApproved  = true,
  isActive    = true,
} = {}) => {
  // Delete if exists from previous run
  await User.deleteOne({ email })

  const user = await User.create({
    name, email, password, role,
    isApproved, isActive,
    isEmailVerified: true,
  })

  const token = generateToken(user._id, role)
  return { user, token }
}

// Clean up specific collections between tests
const cleanCollections = async (...models) => {
  for (const model of models) {
    await model.deleteMany({})
  }
}

module.exports = { generateToken, createTestUser, cleanCollections }
