const { callGemini } = require("../utils/gemini.util");
const { getJobSeekerContext } = require("../utils/aiContext.util");

// ── JOB SEEKER AI CONTROLLER ─────────────────────────────────────────────────

// 1. Resume Optimizer
exports.optimizeResume = async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an elite Tech Recruiter. Context: ${context}` },
      { role: "user", content: `Rewrite my resume bullets to match this job description's ATS keywords. Score my resume-to-job fit before and after.\n\nResume:\n${resume}\n\nJD:\n${jobDescription}` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_resume_optimizer", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Cover Letter Generator
exports.generateCoverLetter = async (req, res) => {
  try {
    const { jobPosting } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an expert Career Coach. Context: ${context}` },
      { role: "user", content: `Write a personalized cover letter for this job posting. Avoid generic phrases. Reference specific company details and map them to my skills.\n\n${jobPosting}` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_cover_letter", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Job Match Analyzer
exports.analyzeJobMatch = async (req, res) => {
  try {
    const { mySkills, jobRequirements } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Career Development AI. Context: ${context}` },
      { role: "user", content: `Compare my skills (${mySkills}) vs these job requirements (${jobRequirements}). Give a gap analysis and specific upskilling recommendations to become a stronger candidate in 30/60/90 days.` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_job_match", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Interview Prep Coach
exports.prepInterview = async (req, res) => {
  try {
    const { roleDetails } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Hiring Manager at a fast-growing startup. Context: ${context}` },
      { role: "user", content: `Generate 20 likely interview questions for this role, along with model answers specific to a startup environment:\n\n${roleDetails}` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_interview_prep", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Career Roadmap Builder
exports.buildCareerRoadmap = async (req, res) => {
  try {
    const { currentRole, targetRole, timeline } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Tech Career Strategist. Context: ${context}` },
      { role: "user", content: `Build a skill-by-skill learning plan to go from ${currentRole} to ${targetRole} within ${timeline}. Include specific courses, projects, and milestones.` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_career_roadmap", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Salary Negotiation Coach
exports.coachSalaryNegotiation = async (req, res) => {
  try {
    const { offerDetails } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a top-tier Salary Negotiation Coach. Context: ${context}` },
      { role: "user", content: `Based on this offer and my experience: ${offerDetails}, script the exact negotiation conversation I should have. Provide fallback positions and a minimum acceptable offer logic.` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_salary_negotiation", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. LinkedIn Profile Optimizer
exports.optimizeLinkedIn = async (req, res) => {
  try {
    const { currentProfile } = req.body;
    const context = await getJobSeekerContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Executive Tech Recruiter. Context: ${context}` },
      { role: "user", content: `Rewrite my LinkedIn headline, About section, and experience bullets to attract startup recruiters. Optimize for keywords relevant to the startup ecosystem:\n\n${currentProfile}` }
    ];
    const aiResponse = await callGemini(req.user.id, "jobseeker_linkedin_optimizer", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
