const JobApplication = require("../models/JobApplication");
const Job            = require("../models/Job");

// ─── APPLY TO JOB ─────────────────────────────────────────────────────────────
// POST /api/job-applications
const applyToJob = async (req, res) => {
  try {
    const { jobId, resumeUrl, coverLetter, portfolioUrl, linkedinUrl } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required." });
    }

    // Check job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    if (job.status === "Closed") {
      return res.status(400).json({ success: false, message: "This job is no longer accepting applications." });
    }
    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot apply to your own job." });
    }

    // Check duplicate
    const existing = await JobApplication.findOne({
      applicant: req.user._id,
      job:       jobId,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied to this job." });
    }

    const application = await JobApplication.create({
      applicant:    req.user._id,
      job:          jobId,
      resumeUrl:    resumeUrl || null,
      coverLetter:  coverLetter || null,
      portfolioUrl: portfolioUrl || null,
      linkedinUrl:  linkedinUrl || null,
      status:       "submitted",
    });

    // Increment applicant count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    console.error("applyToJob error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET MY APPLICATIONS (job seeker) ─────────────────────────────────────────
// GET /api/job-applications/me
const getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user._id })
      .populate("job", "title companyName location jobType workModel salaryMin salaryMax")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET APPLICANTS FOR A JOB (founder/admin) ─────────────────────────────────
// GET /api/job-applications/job/:jobId
const getJobApplicants = async (req, res) => {
  try {
    // Verify ownership
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const applicants = await JobApplication.find({ job: req.params.jobId })
      .populate("applicant", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, applicants });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE APPLICATION STATUS (founder/admin) ────────────────────────────────
// PATCH /api/job-applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewDate, interviewNotes, founderNotes } = req.body;

    const application = await JobApplication.findById(req.params.id)
      .populate("job");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    // Only job poster or admin can update
    if (
      application.job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (status)          application.status          = status;
    if (interviewDate)   application.interviewDate   = interviewDate;
    if (interviewNotes)  application.interviewNotes  = interviewNotes;
    if (founderNotes)    application.founderNotes     = founderNotes;

    await application.save();

    return res.status(200).json({ success: true, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── WITHDRAW APPLICATION (job seeker) ────────────────────────────────────────
// DELETE /api/job-applications/:id
const withdrawApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id:       req.params.id,
      applicant: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    await application.deleteOne();

    // Decrement applicant count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } });

    return res.status(200).json({ success: true, message: "Application withdrawn." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── CHECK IF ALREADY APPLIED ─────────────────────────────────────────────────
// GET /api/job-applications/check/:jobId
const checkIfApplied = async (req, res) => {
  try {
    const existing = await JobApplication.findOne({
      applicant: req.user._id,
      job:       req.params.jobId,
    });

    return res.status(200).json({
      success: true,
      applied: !!existing,
      application: existing || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
  checkIfApplied,
};
