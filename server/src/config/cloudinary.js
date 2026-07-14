const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds — prevents 499 TimeoutError on slow connections
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "boostr_uploads",
    allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"],
    transformation: [{ quality: "auto", fetch_format: "auto" }], // auto-compress on upload
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

module.exports = { cloudinary, upload };
