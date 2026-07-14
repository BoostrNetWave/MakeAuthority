const { Router } = require("express");
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  toggleShare,
  getSharedDocument,
  getVaultStats,
} = require("../controllers/document.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = Router();

// ── PUBLIC (shared link access) ─────────────────────────
router.get("/shared/:token", getSharedDocument);

// ── AUTHENTICATED ───────────────────────────────────────
router.post(   "/",          protect, uploadDocument);
router.get(    "/",          protect, getMyDocuments);
router.get(    "/stats",     protect, getVaultStats);
router.get(    "/:id",       protect, getDocumentById);
router.put(    "/:id",       protect, updateDocument);
router.delete( "/:id",       protect, deleteDocument);
router.post(   "/:id/share", protect, toggleShare);

module.exports = router;
