const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true
  },
  startup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FounderProfile',
    required: false
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true
  },
  workModel: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'Remote'
  },
  salaryRange: {
    type: String, // e.g. "₹5L - ₹10L" or "$50k - $80k"
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  applyUrl: {
    type: String,
    // Provide a URL if applicants should apply externally
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicantCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
