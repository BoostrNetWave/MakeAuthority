require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/User");

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected ✅");

  const existing = await User.findOne({ email: "admin@boostr.in" });
  if (existing) {
    console.log("Admin already exists ✅");
    process.exit();
  }

  await User.create({
    name:            "Boostr Admin",
    email:           "admin@boostr.in",
    password:        "Admin@123456",
    role:            "super_admin",
    isApproved:      true,
    isEmailVerified: true,
    isActive:        true,
  });

  console.log("✅ Super admin created!");
  console.log("Email:    admin@boostr.in");
  console.log("Password: Admin@123456");
  process.exit();
};

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});