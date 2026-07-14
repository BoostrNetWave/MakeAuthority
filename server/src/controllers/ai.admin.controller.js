const { callGemini } = require("../utils/gemini.util");
const { getAdminContext } = require("../utils/aiContext.util");

// ── ADMIN AI CONTROLLER ──────────────────────────────────────────────────────

// 1. Platform Health Report
exports.generateHealthReport = async (req, res) => {
  try {
    const { platformStats } = req.body;
    const context = await getAdminContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Chief Operating Officer (COO) of a SaaS platform. Context: ${context}` },
      { role: "user", content: `Analyze these ecosystem stats: ${platformStats}. Generate an executive-level platform health report with growth trends, churn signals, and feature adoption rates. Make it board-ready.` }
    ];
    const aiResponse = await callGemini(req.user.id, "admin_health_report", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fraud Detection Analyzer
exports.detectFraud = async (req, res) => {
  try {
    const { userRegistrations } = req.body;
    const context = await getAdminContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Cybersecurity and Fraud Detection AI. Context: ${context}` },
      { role: "user", content: `Scan these new user registrations: ${userRegistrations}. Identify suspicious patterns (duplicate IPs, fake company names, bot behavior). Flag accounts for manual review with a confidence score.` }
    ];
    const aiResponse = await callGemini(req.user.id, "admin_fraud_detection", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Content Moderation AI
exports.moderateContent = async (req, res) => {
  try {
    const { flaggedPosts } = req.body;
    const context = await getAdminContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Community Trust & Safety Moderator. Context: ${context}` },
      { role: "user", content: `Review these flagged community posts: ${flaggedPosts}. Classify each as spam, harmful, or acceptable with brief reasoning.` }
    ];
    const aiResponse = await callGemini(req.user.id, "admin_moderate_content", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Grant Curation Assistant
exports.curateGrant = async (req, res) => {
  try {
    const { rawGrantData } = req.body;
    const context = await getAdminContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an expert Data Extractor and Analyst for Government Grants. Context: ${context}` },
      { role: "user", content: `Extract all fields (eligibility, deadline, amount, focus sector) from this raw grant announcement text and format it as a clean JSON draft for admin review:\n\n${rawGrantData}` }
    ];
    const aiResponse = await callGemini(req.user.id, "admin_curate_grant", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Investor Verification Assistant
exports.verifyInvestor = async (req, res) => {
  try {
    const { investorProfile, linkedinData } = req.body;
    const context = await getAdminContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a KYC / Verification Specialist for Venture Capital. Context: ${context}` },
      { role: "user", content: `Cross-check this pending investor profile: ${investorProfile} against this LinkedIn data: ${linkedinData}. Look for inconsistencies in claimed credentials, portfolio companies, and firm affiliation. Return a verification confidence score.` }
    ];
    const aiResponse = await callGemini(req.user.id, "admin_verify_investor", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
