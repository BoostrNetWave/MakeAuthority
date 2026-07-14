const { callGemini } = require("../utils/gemini.util");
const { getIncubatorContext } = require("../utils/aiContext.util");

// ── INCUBATOR AI CONTROLLER ──────────────────────────────────────────────────

// 1. Cohort Curriculum Generator
exports.generateCurriculum = async (req, res) => {
  try {
    const { focus } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an elite Accelerator Program Director. Context: ${context}` },
      { role: "user", content: `Generate a full 12-week accelerator syllabus tailored for this focus: ${focus || 'General Tech'}. Include weekly themes, guest speaker topics, and milestone checkpoints.` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_curriculum", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Startup Application Scorer
exports.scoreApplicant = async (req, res) => {
  try {
    const { applicationData } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Accelerator Admissions Committee Member. Context: ${context}` },
      { role: "user", content: `Read this startup application. Score them 0-100 on Team, Market, Innovation, and Stage Fit. Provide a final accept/reject recommendation:\n\n${applicationData}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_score_applicant", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Cohort Diversity Analyzer
exports.analyzeDiversity = async (req, res) => {
  try {
    const { cohortData } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Ecosystem Diversity & Inclusion Director. Context: ${context}` },
      { role: "user", content: `Analyze the accepted startups in this cohort data. Identify industry, gender, and geography gaps. Recommend waitlist promotion strategies for optimal cohort balance:\n\n${cohortData}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_diversity_check", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Demo Day Script Writer
exports.writeDemoDayScript = async (req, res) => {
  try {
    const { startupInfo } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a world-class Pitch Coach (like Y Combinator partners). Context: ${context}` },
      { role: "user", content: `Write a compelling 3-minute Demo Day pitch script for this startup. Include a strong investor-hook opening, traction highlights, and a clear ask:\n\n${startupInfo}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_demo_script", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Mentor Matcher AI
exports.matchMentors = async (req, res) => {
  try {
    const { startupWeaknesses, mentorsList } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Accelerator Mentor-in-Residence. Context: ${context}` },
      { role: "user", content: `Analyze this startup's current weaknesses: ${startupWeaknesses}. From this list of available mentors, recommend the 3 best matches with specific reasoning for each:\n\n${mentorsList}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_mentor_match", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Progress Report Generator
exports.generateProgressReport = async (req, res) => {
  try {
    const { milestones } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Program Director reporting to Government Sponsors and LPs. Context: ${context}` },
      { role: "user", content: `Draft a professional monthly cohort progress report based on these startup milestone updates:\n\n${milestones}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_progress_report", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Grant Application Assistant
exports.applyForGrant = async (req, res) => {
  try {
    const { grantDetails } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an expert Grant Writer for Tech Incubators applying for government funding (e.g. DPIIT, BIRAC). Context: ${context}` },
      { role: "user", content: `Write a compelling grant application for our incubator based on this grant's requirements. Highlight our cohort outcomes and program data:\n\n${grantDetails}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_grant_apply", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Equity Agreement Drafter
exports.draftEquityAgreement = async (req, res) => {
  try {
    const { terms } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Startup Lawyer specializing in Accelerator Equity Agreements. Context: ${context}` },
      { role: "user", content: `Draft a standard incubation agreement based on these terms: ${terms}. Ensure you cover equity %, program duration, IP clauses, and exit provisions.` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_equity_agreement", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Sponsor Pitch Writer
exports.writeSponsorPitch = async (req, res) => {
  try {
    const { cohortStats } = req.body;
    const context = await getIncubatorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a B2B Partnerships Director at a top Accelerator. Context: ${context}` },
      { role: "user", content: `Write a persuasive corporate sponsor pitch deck outline. Show the clear ROI of sponsoring our program (talent pipeline, brand visibility, deal flow) based on these cohort stats:\n\n${cohortStats}` }
    ];
    const aiResponse = await callGemini(req.user.id, "incubator_sponsor_pitch", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
