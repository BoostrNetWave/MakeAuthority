const { callGemini } = require("../utils/gemini.util");
const { getInvestorContext } = require("../utils/aiContext.util");

// ── INVESTOR AI CONTROLLER ───────────────────────────────────────────────────

// 1. Due Diligence Analyzer
exports.analyzeDueDiligence = async (req, res) => {
  try {
    const { startupData } = req.body;
    if (!startupData) return res.status(400).json({ success: false, message: "Missing startupData" });
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an elite VC Due Diligence Analyst. Context: ${context}` },
      { role: "user", content: `Analyze this data room info and flag financial risks, red flags, and missing disclosures. Output a structured DD report:\n\n${startupData}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_due_diligence", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Deal Memo Generator
exports.generateDealMemo = async (req, res) => {
  try {
    const { startupContextStr } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Partner at a top VC firm writing an Investment Committee Memo. Context: ${context}` },
      { role: "user", content: `Write a full IC memo (thesis, risks, valuation, recommendation) for this startup:\n\n${startupContextStr}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_deal_memo", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Startup Scoring Report
exports.scoreStartup = async (req, res) => {
  try {
    const { startupContextStr } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a quantitative VC analyst. Context: ${context}` },
      { role: "user", content: `Score this startup 1-100 across Team, Market, Product, Traction, and Financials. Provide detailed reasoning for each dimension:\n\n${startupContextStr}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_startup_score", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Competitive Landscape Map
exports.mapCompetitors = async (req, res) => {
  try {
    const { startupContextStr } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an industry landscape expert. Context: ${context}` },
      { role: "user", content: `Map out up to 10 competitors for this startup. Include their funding, differentiation, and market position. Validate or challenge their TAM claim:\n\n${startupContextStr}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_competitive_map", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Portfolio Risk Assessor
exports.assessPortfolioRisk = async (req, res) => {
  try {
    const { portfolioData } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a VC Portfolio Risk Manager. Context: ${context}` },
      { role: "user", content: `Analyze this portfolio data. Identify industry overexposure, stage concentration risk, and geographic gaps. Output specific hedge recommendations:\n\n${portfolioData || 'Use the context provided to analyze risk.'}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_portfolio_risk", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Follow-on Investment Advisor
exports.adviseFollowOn = async (req, res) => {
  try {
    const { companyUpdate } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a strategic VC Advisor. Context: ${context}` },
      { role: "user", content: `Based on this portfolio company's traction signals and current market conditions, recommend whether we should follow-on in their next round:\n\n${companyUpdate}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_follow_on_advice", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Thesis Refiner
exports.refineThesis = async (req, res) => {
  try {
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a visionary VC fund strategist. Context: ${context}` },
      { role: "user", content: `Analyze my past investments and current macroeconomic trends. Suggest thesis refinements to improve deal flow quality and ROI.` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_thesis_refiner", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Term Sheet Drafter
exports.draftTermSheet = async (req, res) => {
  try {
    const { valuation, equity, keyTerms } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a seasoned startup lawyer and VC partner. Context: ${context}` },
      { role: "user", content: `Draft a standard term sheet (SAFE or Equity). Valuation: ${valuation}, Equity %: ${equity}, Key Terms: ${keyTerms}. Output in plain English summary first, followed by standard legal clauses.` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_term_sheet", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Founder Rejection Email
exports.draftRejectionEmail = async (req, res) => {
  try {
    const { startupName, reason } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a founder-friendly VC Partner. Context: ${context}` },
      { role: "user", content: `Draft a kind, specific, and constructive rejection email for the startup "${startupName}". Reason for pass: ${reason}. Leave the door open for future rounds. Make it genuine.` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_rejection_email", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. LP Update Writer
exports.writeLPUpdate = async (req, res) => {
  try {
    const { updates } = req.body;
    const context = await getInvestorContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Investor Relations Director at a VC fund. Context: ${context}` },
      { role: "user", content: `Draft a quarterly Limited Partner (LP) update email based on these portfolio milestones, exits, and new investments:\n\n${updates}` }
    ];
    const aiResponse = await callGemini(req.user.id, "investor_lp_update", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
