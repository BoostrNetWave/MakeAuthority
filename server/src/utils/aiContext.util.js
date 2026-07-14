const FounderProfile = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");
const Incubator = require("../models/incubator");
const User = require("../models/User");

// ── ROLE: FOUNDER ────────────────────────────────────────────────────────────
const getFounderContext = async (userId) => {
  const profile = await FounderProfile.findOne({ user: userId });
  if (!profile) return "Role: Startup Founder. (Profile incomplete)";
  
  return `
Role: Startup Founder
Startup Name: ${profile.startupName || "Not set"}
Industry: ${profile.industry || "Not set"}
Funding Stage: ${profile.fundingStage || "Not set"}
Revenue Stage: ${profile.revenueStage || "Not set"}
Description: ${profile.description || "Not set"}
Location: ${[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "India"}
Team Size: ${profile.teamSize || 1}
Tech Stack: ${profile.techStack?.join(", ") || "Not specified"}
Funding Required: ${profile.fundingRequired ? `$${profile.fundingRequired.toLocaleString()}` : "Not specified"}
  `.trim();
};

// ── ROLE: INVESTOR ───────────────────────────────────────────────────────────
const getInvestorContext = async (userId) => {
  const profile = await InvestorProfile.findOne({ user: userId });
  if (!profile) return "Role: Investor. (Profile incomplete)";

  return `
Role: Investor / VC
Firm Name: ${profile.firmName || "Independent Angel"}
Investment Thesis: ${profile.investmentThesis || "Not specified"}
Preferred Stages: ${profile.preferredStages?.join(", ") || "Agnostic"}
Preferred Industries: ${profile.preferredIndustries?.join(", ") || "Agnostic"}
Typical Ticket Size: ${profile.ticketSizeMin ? `$${profile.ticketSizeMin}` : "0"} to ${profile.ticketSizeMax ? `$${profile.ticketSizeMax}` : "Uncapped"}
Portfolio Size: ${profile.portfolioCount || 0} companies
Location: ${[profile.city, profile.country].filter(Boolean).join(", ") || "India"}
  `.trim();
};

// ── ROLE: INCUBATOR ──────────────────────────────────────────────────────────
const getIncubatorContext = async (userId) => {
  const profile = await Incubator.findOne({ user: userId });
  if (!profile) return "Role: Incubator / Accelerator. (Profile incomplete)";

  return `
Role: Incubator / Accelerator
Organization Name: ${profile.organizationName || "Not set"}
Description: ${profile.description || "Not specified"}
Program Focus: ${profile.focusIndustries?.join(", ") || "Agnostic"}
Cohort Size: ${profile.averageCohortSize || "Not specified"} startups
Program Duration: ${profile.programDurationWeeks || 12} weeks
Funding Offered: ${profile.offersFunding ? "Yes" : "No"}
Location: ${[profile.city, profile.state].filter(Boolean).join(", ") || "India"}
  `.trim();
};

// ── ROLE: SERVICE PROVIDER ───────────────────────────────────────────────────
const getProviderContext = async (userId) => {
  const user = await User.findById(userId);
  return `
Role: Startup Service Provider (CA, Legal, Tech, Consulting)
Name: ${user?.name || "Provider"}
Email: ${user?.email || "Unknown"}
Goal: To draft proposals, SLAs, invoices, and acquire startup clients.
  `.trim();
};

// ── ROLE: JOB SEEKER ─────────────────────────────────────────────────────────
const getJobSeekerContext = async (userId) => {
  const user = await User.findById(userId);
  return `
Role: Job Seeker in Startup Ecosystem
Name: ${user?.name || "Candidate"}
Goal: Optimize resume, draft cover letters, prepare for startup interviews, and negotiate salary.
  `.trim();
};

// ── ROLE: ADMIN ──────────────────────────────────────────────────────────────
const getAdminContext = async (userId) => {
  return `
Role: Super Admin / Platform Manager
Goal: Analyze platform health, moderate content, detect fraud, and curate grants/investors.
  `.trim();
};

module.exports = {
  getFounderContext,
  getInvestorContext,
  getIncubatorContext,
  getProviderContext,
  getJobSeekerContext,
  getAdminContext
};
