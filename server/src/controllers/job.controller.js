const Job = require('../models/Job');
const Startup = require('../models/founderProfile.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location, workModel } = req.query;
    
    // Build query object
    let query = { status: 'Open' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.jobType = type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (workModel) {
      query.workModel = workModel;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get logged in user's posted jobs
// @route   GET /api/jobs/me
// @access  Private (Founder/Admin)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('startup', 'name logo website');
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Founder or Admin)
exports.createJob = async (req, res) => {
  try {
    // Add user to req.body
    req.body.postedBy = req.user.id;
    
    // If user is a founder, try to link their startup automatically
    if (req.user.role === 'founder') {
      const startup = await Startup.findOne({ user: req.user.id });
      if (startup) {
        req.body.startup = startup._id;
        req.body.companyName = startup.startupName; // override if needed or fallback
      }
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user owns the job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    res.json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user owns the job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
