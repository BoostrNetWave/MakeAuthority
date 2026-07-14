const { Router } = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { upload, cloudinary } = require("../config/cloudinary");

const router = Router();

// GET /api/upload/sign

router.get("/sign", protect, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder    = "boostr_uploads";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success:    true,
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Sign error:", error);
    return res.status(500).json({ success: false, message: "Could not generate upload signature." });
  }
});

// POST /api/upload
router.post("/", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }
    return res.status(200).json({ success: true, url: req.file.path });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during upload." });
  }
});

module.exports = router;
