const Service = require("../models/Service");
const Proposal = require("../models/Proposal");

// ─── CREATE A SERVICE ──────────────────────────────────
// POST /api/services
const createService = async (req, res) => {
  try {
    const { title, category, price, description, coverImage, tags } = req.body;

    const service = await Service.create({
      provider: req.user._id,
      title,
      category,
      price,
      description,
      coverImage,
      tags
    });

    return res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("createService error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET ALL SERVICES ──────────────────────────────────
// GET /api/services
const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(filter)
      .populate("provider", "name avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("getServices error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE SERVICE ────────────────────────────────
// GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "name avatar email")
      .populate("reviews.user", "name avatar");

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    return res.status(200).json({ success: true, service });
  } catch (error) {
    console.error("getServiceById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADD REVIEW ────────────────────────────────────────
// POST /api/services/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Optional: check if user already reviewed
    const alreadyReviewed = service.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You already reviewed this service." });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    };

    service.reviews.push(review);
    service.numReviews = service.reviews.length;
    service.averageRating =
      service.reviews.reduce((acc, item) => item.rating + acc, 0) / service.reviews.length;

    await service.save();

    return res.status(201).json({ success: true, message: "Review added successfully." });
  } catch (error) {
    console.error("addReview error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── SUBMIT PROPOSAL ───────────────────────────────────
// POST /api/services/:id/proposals
const submitProposal = async (req, res) => {
  try {
    const { message, budget } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Don't allow providers to submit proposals to themselves
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot submit a proposal to your own service." });
    }

    const proposal = await Proposal.create({
      service: service._id,
      founder: req.user._id,
      message,
      budget,
    });

    return res.status(201).json({ success: true, proposal, message: "Proposal sent successfully!" });
  } catch (error) {
    console.error("submitProposal error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET PROPOSALS ─────────────────────────────────────
// GET /api/services/proposals/me
// If service_provider: get proposals for their services
// If founder: get proposals they submitted
const getMyProposals = async (req, res) => {
  try {
    let proposals;

    if (req.user.role === "service_provider") {
      // Find all services owned by this provider
      const myServices = await Service.find({ provider: req.user._id }).select("_id");
      const serviceIds = myServices.map((s) => s._id);

      proposals = await Proposal.find({ service: { $in: serviceIds } })
        .populate("service", "title")
        .populate("founder", "name email avatar")
        .sort({ createdAt: -1 });
    } else {
      // Fetch for founder
      proposals = await Proposal.find({ founder: req.user._id })
        .populate("service", "title category provider")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({ success: true, proposals });
  } catch (error) {
    console.error("getMyProposals error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE PROPOSAL STATUS ────────────────────────────
// PUT /api/services/proposals/:id
const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted or rejected
    const proposal = await Proposal.findById(req.params.id).populate("service");

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    // Only the service provider can update the status
    if (proposal.service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this proposal." });
    }

    proposal.status = status;
    await proposal.save();

    return res.status(200).json({ success: true, proposal });
  } catch (error) {
    console.error("updateProposalStatus error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  addReview,
  submitProposal,
  getMyProposals,
  updateProposalStatus,
};
