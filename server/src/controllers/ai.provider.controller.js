const { callGemini } = require("../utils/gemini.util");
const { getProviderContext } = require("../utils/aiContext.util");

// ── SERVICE PROVIDER AI CONTROLLER ───────────────────────────────────────────

// 1. Proposal Writer
exports.writeProposal = async (req, res) => {
  try {
    const { jobPosting } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an expert B2B Sales Consultant. Context: ${context}` },
      { role: "user", content: `Read this startup job posting and draft a tailored Scope of Work (SOW) proposal. Highlight my relevant skills and suggest competitive pricing:\n\n${jobPosting}` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_proposal_writer", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Cold Outreach Generator
exports.generateColdOutreach = async (req, res) => {
  try {
    const { startupProfile } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an elite B2B SDR (Sales Development Rep). Context: ${context}` },
      { role: "user", content: `Write a highly personalized cold outreach message to the founder of this startup. Don't sound salesy. Focus on how my specific services can solve their likely bottlenecks at their current stage:\n\n${startupProfile}` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_cold_outreach", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Service Listing Optimizer
exports.optimizeListing = async (req, res) => {
  try {
    const { currentListing } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Marketplace SEO & Conversion Expert. Context: ${context}` },
      { role: "user", content: `Rewrite my service listing to maximize discoverability and conversions. Provide 2 distinct A/B test versions (title, description, tags) and recommend the winner:\n\n${currentListing}` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_listing_optimizer", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. SLA Generator
exports.generateSLA = async (req, res) => {
  try {
    const { slaDetails } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Contract Lawyer. Context: ${context}` },
      { role: "user", content: `Generate a full Service Level Agreement (SLA) based on these details: ${slaDetails}. Ensure it includes penalty clauses, revision limits, and IP ownership sections.` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_sla_generator", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. NDA Drafter
exports.draftNDA = async (req, res) => {
  try {
    const { partyDetails } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are an Indian Corporate Lawyer. Context: ${context}` },
      { role: "user", content: `Generate a bilateral Non-Disclosure Agreement (NDA) customized for Indian jurisdiction. Parties involved: ${partyDetails}. Include specific confidentiality periods and remedies clauses.` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_nda_drafter", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Invoice Generator
exports.generateInvoice = async (req, res) => {
  try {
    const { projectDetails } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a Chartered Accountant expert in Indian GST. Context: ${context}` },
      { role: "user", content: `Generate a professional, GST-compliant invoice text based on this project: ${projectDetails}. Include placeholders for GSTIN, HSN/SAC codes, and note TDS applicability.` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_invoice_generator", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Pricing Strategy Advisor
exports.advisePricing = async (req, res) => {
  try {
    const { myServices, marketData } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a B2B Pricing Strategy Consultant. Context: ${context}` },
      { role: "user", content: `Analyze my current services: ${myServices}. Compare against this market data: ${marketData}. Recommend optimal pricing tiers (Basic/Pro/Premium) and identify where I might be underpricing.` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_pricing_advisor", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Review Response Writer
exports.writeReviewResponse = async (req, res) => {
  try {
    const { clientReview } = req.body;
    const context = await getProviderContext(req.user.id);
    const messages = [
      { role: "system", content: `You are a PR and Customer Success Expert. Context: ${context}` },
      { role: "user", content: `Draft a professional, empathetic public response to this client review: "${clientReview}". If it's negative, suggest specific resolution steps to rebuild trust.` }
    ];
    const aiResponse = await callGemini(req.user.id, "provider_review_response", messages);
    res.json({ success: true, content: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
