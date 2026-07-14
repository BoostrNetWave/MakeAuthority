const Document = require("../models/Document");
const crypto   = require("crypto");

// ─── UPLOAD DOCUMENT ──────────────────────────────────────────────────────────
// POST /api/documents
const uploadDocument = async (req, res) => {
  try {
    const { name, description, folder, fileUrl, fileType, fileSize, mimeType } = req.body;

    if (!name || !folder || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, folder, and fileUrl are required.",
      });
    }

    const document = await Document.create({
      owner:       req.user._id,
      name,
      description: description || null,
      folder,
      fileUrl,
      fileType:    fileType || "pdf",
      fileSize:    fileSize || 0,
      mimeType:    mimeType || null,
      versions: [{
        url:        fileUrl,
        uploadedBy: req.user._id,
        size:       fileSize || 0,
        note:       "Initial upload",
      }],
    });

    return res.status(201).json({ success: true, document });
  } catch (error) {
    console.error("uploadDocument error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET MY DOCUMENTS ─────────────────────────────────────────────────────────
// GET /api/documents?folder=pitch_decks
const getMyDocuments = async (req, res) => {
  try {
    const { folder, search } = req.query;
    const filter = { owner: req.user._id, isDeleted: false };

    if (folder) filter.folder = folder;
    if (search) filter.name = new RegExp(search, "i");

    const documents = await Document.find(filter)
      .sort({ updatedAt: -1 });

    // Group by folder
    const grouped = {};
    documents.forEach(doc => {
      if (!grouped[doc.folder]) grouped[doc.folder] = [];
      grouped[doc.folder].push(doc);
    });

    return res.status(200).json({
      success: true,
      total:   documents.length,
      documents,
      grouped,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE DOCUMENT ──────────────────────────────────────────────────────
// GET /api/documents/:id
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id:       req.params.id,
      isDeleted: false,
    }).populate("owner", "name email")
      .populate("sharedWith.user", "name email");

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    // Check access — owner or shared with
    const isOwner  = document.owner._id.toString() === req.user._id.toString();
    const isShared = document.sharedWith.some(s => s.user._id.toString() === req.user._id.toString());
    const isAdmin  = req.user.role === "super_admin";

    if (!isOwner && !isShared && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    return res.status(200).json({ success: true, document });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE DOCUMENT (add new version) ───────────────────────────────────────
// PUT /api/documents/:id
const updateDocument = async (req, res) => {
  try {
    const { name, description, fileUrl, fileSize, note } = req.body;

    const document = await Document.findOne({
      _id:       req.params.id,
      owner:     req.user._id,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    if (name)        document.name        = name;
    if (description) document.description = description;

    // New file version uploaded
    if (fileUrl && fileUrl !== document.fileUrl) {
      document.versions.push({
        url:        document.fileUrl, // save previous version
        uploadedBy: req.user._id,
        size:       document.fileSize,
        note:       note || `Version ${document.currentVersion}`,
      });
      document.fileUrl        = fileUrl;
      document.fileSize       = fileSize || document.fileSize;
      document.currentVersion += 1;
    }

    await document.save();
    return res.status(200).json({ success: true, document });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE DOCUMENT (soft) ───────────────────────────────────────────────────
// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Document deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── TOGGLE SHARE ─────────────────────────────────────────────────────────────
// POST /api/documents/:id/share
const toggleShare = async (req, res) => {
  try {
    const { isShared, expiryDays } = req.body;

    const document = await Document.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    document.isShared = isShared !== undefined ? isShared : !document.isShared;

    if (document.isShared) {
      // Generate secure share link token
      document.shareLink       = crypto.randomBytes(32).toString("hex");
      document.shareLinkExpiry = expiryDays
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        : null; // null = never expires
    } else {
      document.shareLink       = null;
      document.shareLinkExpiry = null;
    }

    await document.save({ validateBeforeSave: false });

    return res.status(200).json({
      success:   true,
      isShared:  document.isShared,
      shareLink: document.isShared
        ? `${process.env.CLIENT_ORIGIN}/vault/shared/${document.shareLink}`
        : null,
      expiry: document.shareLinkExpiry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ACCESS SHARED DOCUMENT (public) ─────────────────────────────────────────
// GET /api/documents/shared/:token
const getSharedDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      shareLink: req.params.token,
      isShared:  true,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Shared document not found or link expired." });
    }

    // Check expiry
    if (document.shareLinkExpiry && document.shareLinkExpiry < new Date()) {
      return res.status(410).json({ success: false, message: "This share link has expired." });
    }

    return res.status(200).json({
      success: true,
      document: {
        name:      document.name,
        fileUrl:   document.fileUrl,
        fileType:  document.fileType,
        folder:    document.folder,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET VAULT STATS ──────────────────────────────────────────────────────────
// GET /api/documents/stats
const getVaultStats = async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user._id, isDeleted: false });

    const stats = {
      totalDocuments: docs.length,
      totalSize:      docs.reduce((sum, d) => sum + (d.fileSize || 0), 0),
      byFolder:       {},
      sharedCount:    docs.filter(d => d.isShared).length,
    };

    docs.forEach(doc => {
      if (!stats.byFolder[doc.folder]) stats.byFolder[doc.folder] = 0;
      stats.byFolder[doc.folder]++;
    });

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  toggleShare,
  getSharedDocument,
  getVaultStats,
};
