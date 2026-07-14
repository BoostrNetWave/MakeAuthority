const { callGemini } = require("../utils/gemini.util");
const { getFounderContext } = require("../utils/aiContext.util");
const FounderProfile  = require("../models/founderProfile.model");
const InvestorProfile = require("../models/investorProfile.model");
const Grant       = require("../models/Grant");
const AIUsageLog = require("../models/AIUsageLog");

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 12A: GRANT ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/grant-recommendations
const grantRecommendations = async (req, res) => {
  try {
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({
        success: false,
        message: "Please create your startup profile first.",
      });
    }

    const grants = await Grant.find({ isActive: true }).limit(20)
      .select("grantName organization category fundingAmountMin fundingAmountMax eligibility eligibleIndustries eligibleStages deadline");

    const grantList = grants.map((g, i) =>
      `${i + 1}. ${g.grantName} by ${g.organization} - ${g.category} - Up to $${g.fundingAmountMax?.toLocaleString() || "varies"} - Eligible: ${g.eligibleIndustries.join(", ")}`
    ).join("\n");

    const content = await callGemini(req.user._id, "grant_recommendations", [
      {
        role: "system",
        content: `You are an expert Indian startup grant advisor with deep knowledge of government schemes, CSR grants, and startup funding programs. You analyze startups and match them with the most suitable grants. Always be specific, actionable, and encouraging. Format your response in clear sections.`,
      },
      {
        role: "user",
        content: `Analyze this startup and recommend the best grants from the list below:

STARTUP PROFILE:
${context}

AVAILABLE GRANTS:
${grantList}

Please provide:
1. Top 3-5 recommended grants ranked by fit, with explanation of WHY each is a good match
2. Key eligibility points to address for each grant
3. Application tips specific to this startup
4. Any grants the startup should avoid and why

Be specific and actionable.`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "grant_recommendations" });
  } catch (error) {
    console.error("grantRecommendations error:", error);
    return res.status(500).json({ success: false, message: "AI service error. Please try again." });
  }
};

// POST /api/ai/grant-eligibility-check
const grantEligibilityCheck = async (req, res) => {
  try {
    const { grantId } = req.body;
    if (!grantId) {
      return res.status(400).json({ success: false, message: "Grant ID required." });
    }

    const [context, grant] = await Promise.all([
      getFounderContext(req.user._id),
      Grant.findById(grantId),
    ]);

    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }
    if (!grant) {
      return res.status(404).json({ success: false, message: "Grant not found." });
    }

    const content = await callGemini(req.user._id, "grant_eligibility_check", [
      {
        role: "system",
        content: "You are a grant eligibility expert. Analyze startup profiles against grant requirements with precise, honest assessments. Use ✅ for met criteria, ⚠️ for partial, ❌ for unmet.",
      },
      {
        role: "user",
        content: `Check if this startup is eligible for this grant:

STARTUP:
${context}

GRANT: ${grant.grantName} by ${grant.organization}
Category: ${grant.category}
Eligibility Criteria: ${grant.eligibility}
Eligible Industries: ${grant.eligibleIndustries.join(", ")}
Eligible Stages: ${grant.eligibleStages.join(", ")}
Funding: Up to $${grant.fundingAmountMax?.toLocaleString() || "varies"}
Deadline: ${grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "Rolling"}

Provide:
1. Overall eligibility verdict (Eligible / Partially Eligible / Not Eligible)
2. Criteria-by-criteria breakdown with ✅ ⚠️ ❌
3. Specific gaps to address before applying
4. Probability of success (%) with reasoning
5. If eligible: top 3 things to emphasize in application`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "grant_eligibility_check" });
  } catch (error) {
    console.error("grantEligibilityCheck error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/application-guidance
const applicationGuidance = async (req, res) => {
  try {
    const { grantId, specificQuestion } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    let grantContext = "";
    if (grantId) {
      const grant = await Grant.findById(grantId);
      if (grant) {
        grantContext = `\nGrant: ${grant.grantName}\nOrganization: ${grant.organization}\nRequirements: ${grant.eligibility}\nApplication Process: ${grant.applicationProcess || "Standard application"}`;
      }
    }

    const content = await callGemini(req.user._id, "application_guidance", [
      {
        role: "system",
        content: "You are an expert grant writer and startup advisor. You help founders craft compelling grant applications. Be specific, use data-driven language, and focus on impact.",
      },
      {
        role: "user",
        content: `Provide application guidance for this startup:

STARTUP:
${context}
${grantContext}

${specificQuestion ? `SPECIFIC QUESTION: ${specificQuestion}` : ""}

Provide:
1. Step-by-step application strategy
2. Key narratives to emphasize
3. Common mistakes to avoid
4. Template answers for standard grant questions (problem statement, solution, impact, team)
5. Documents to prepare
6. Timeline recommendations`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "application_guidance" });
  } catch (error) {
    console.error("applicationGuidance error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 12B: FUNDRAISING ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/investor-recommendations
const investorRecommendations = async (req, res) => {
  try {
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const investors = await InvestorProfile.find({ isVerifiedByAdmin: true })
      .limit(30)
      .select("firmName investorType industriesOfInterest investmentStages ticketSizeMin ticketSizeMax geographicPreference bio designation");

    const investorList = investors.map((inv, i) =>
      `${i + 1}. ${inv.firmName || "Independent"} - ${inv.investorType} - Industries: ${inv.industriesOfInterest?.join(", ") || "All"} - Stages: ${inv.investmentStages?.join(", ") || "All"} - Ticket: $${inv.ticketSizeMin?.toLocaleString() || "?"} to $${inv.ticketSizeMax?.toLocaleString() || "?"}`
    ).join("\n");

    const content = await callGemini(req.user._id, "investor_recommendations", [
      {
        role: "system",
        content: "You are a top-tier startup fundraising advisor who has helped hundreds of Indian startups raise capital. You understand investor psychology, thesis alignment, and deal dynamics.",
      },
      {
        role: "user",
        content: `Recommend the best investors for this startup:

STARTUP:
${context}

AVAILABLE INVESTORS:
${investorList}

Provide:
1. Top 5 investor recommendations ranked by fit with detailed reasoning
2. Why each investor is a strong match (thesis, portfolio fit, stage fit)
3. Red flags or misalignments to be aware of
4. Suggested approach strategy for each
5. Overall fundraising readiness assessment (1-10) with improvements needed`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "investor_recommendations" });
  } catch (error) {
    console.error("investorRecommendations error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/fundraising-roadmap
const fundraisingRoadmap = async (req, res) => {
  try {
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const content = await callGemini(req.user._id, "fundraising_roadmap", [
      {
        role: "system",
        content: "You are a seasoned fundraising strategist who has worked with 200+ Indian startups. You create detailed, realistic fundraising roadmaps tailored to each startup's stage and goals.",
      },
      {
        role: "user",
        content: `Create a comprehensive fundraising roadmap for this startup:

${context}

Provide a detailed 6-12 month roadmap including:
1. Current stage assessment and readiness score
2. Month-by-month action plan with specific milestones
3. Key metrics to hit before approaching investors
4. Which investor types to approach and in what order
5. Pitch narrative framework
6. Due diligence preparation checklist
7. Red flags to resolve before fundraising
8. Realistic timeline and funding targets
9. Alternative funding sources to explore in parallel (grants, revenue-based, etc.)

Make it extremely actionable and India-startup-ecosystem specific.`,
      },
    ], 3000);

    return res.status(200).json({ success: true, content, function: "fundraising_roadmap" });
  } catch (error) {
    console.error("fundraisingRoadmap error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/outreach-suggestions
const investorOutreachSuggestions = async (req, res) => {
  try {
    const { investorId } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    let investorContext = "";
    if (investorId) {
      const inv = await InvestorProfile.findById(investorId)
        .populate("user", "name");
      if (inv) {
        investorContext = `\nTarget Investor: ${inv.firmName || inv.user?.name}\nType: ${inv.investorType}\nFocus: ${inv.industriesOfInterest?.join(", ")}\nStages: ${inv.investmentStages?.join(", ")}\nBio: ${inv.bio || "Not available"}`;
      }
    }

    const content = await callGemini(req.user._id, "outreach_suggestions", [
      {
        role: "system",
        content: "You are an expert at crafting personalized investor outreach. You write compelling, concise, and personalized messages that get responses. You understand Indian startup culture and investor preferences.",
      },
      {
        role: "user",
        content: `Write investor outreach messages for this startup:

STARTUP:
${context}
${investorContext}

Generate:
1. Cold email template (under 150 words) — subject line + body
2. LinkedIn message template (under 100 words)
3. WhatsApp intro message (under 50 words)
4. Follow-up email for no response (1 week later)
5. Key talking points for the first call
6. What NOT to say (common mistakes)

Make each message feel personal, not templated. Reference specific investor thesis points if provided.`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "outreach_suggestions" });
  } catch (error) {
    console.error("investorOutreachSuggestions error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 12C: BUSINESS PLAN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/business-plan
const generateBusinessPlan = async (req, res) => {
  try {
    const { additionalContext } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const content = await callGemini(req.user._id, "business_plan", [
      {
        role: "system",
        content: "You are a professional business plan writer and startup strategist. You create comprehensive, investor-ready business plans that are specific, data-driven, and compelling. Format with clear sections and subsections.",
      },
      {
        role: "user",
        content: `Generate a comprehensive business plan for this startup:

${context}
${additionalContext ? `\nAdditional Context: ${additionalContext}` : ""}

Generate a complete business plan with these sections:
1. Executive Summary (elevator pitch, key metrics, ask)
2. Problem Statement (market pain, current solutions, gaps)
3. Solution (product/service, unique value proposition, key features)
4. Market Analysis (TAM/SAM/SOM, growth trends, India-specific insights)
5. Business Model (revenue streams, pricing, unit economics)
6. Go-to-Market Strategy (customer acquisition, partnerships, channels)
7. Competitive Analysis (competitors, differentiation, moat)
8. Financial Projections (3-year P&L overview, key assumptions)
9. Team & Execution (roles, gaps, hiring plan)
10. Funding Ask (amount, use of funds, milestones)
11. Risks & Mitigation

Be specific with numbers where possible. Make it India-startup-market specific.`,
      },
    ], 4000);

    return res.status(200).json({ success: true, content, function: "business_plan" });
  } catch (error) {
    console.error("generateBusinessPlan error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/pitch-deck-content
const generatePitchDeckContent = async (req, res) => {
  try {
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const content = await callGemini(req.user._id, "pitch_deck_content", [
      {
        role: "system",
        content: "You are a pitch deck expert who has reviewed thousands of decks from Y Combinator, Sequoia, and top Indian VCs. You write compelling, concise slide content that tells a story and gets meetings.",
      },
      {
        role: "user",
        content: `Generate compelling pitch deck content for this startup:

${context}

Create slide-by-slide content for a 12-slide deck:
Slide 1: Title & Tagline (company name, one-liner, contact)
Slide 2: The Problem (specific pain, who feels it, how big)
Slide 3: The Solution (what you built, key differentiator)
Slide 4: Product Demo Narrative (what to show, key features to highlight)
Slide 5: Market Size (TAM/SAM/SOM with sources, India + global)
Slide 6: Business Model (how you make money, pricing, unit economics)
Slide 7: Traction (metrics, growth, key wins — use placeholders if needed)
Slide 8: Go-to-Market (how you'll scale, channels, partnerships)
Slide 9: Competition (landscape, your position, unfair advantages)
Slide 10: Team (key members, relevant experience, advisory board)
Slide 11: Financial Ask (raising X, use of funds breakdown, runway)
Slide 12: Vision (where you'll be in 3-5 years)

For each slide: headline, 3-4 bullet points, and design notes.`,
      },
    ], 3500);

    return res.status(200).json({ success: true, content, function: "pitch_deck_content" });
  } catch (error) {
    console.error("generatePitchDeckContent error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/financial-projection
const generateFinancialProjection = async (req, res) => {
  try {
    const { revenueModel, currentMRR, targetFunding } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const content = await callGemini(req.user._id, "financial_projection", [
      {
        role: "system",
        content: "You are a CFO-level financial modeler specializing in early-stage startups. You create realistic, investor-credible financial projections with clear assumptions.",
      },
      {
        role: "user",
        content: `Generate financial projections for this startup:

${context}
${revenueModel ? `Revenue Model: ${revenueModel}` : ""}
${currentMRR ? `Current MRR: $${currentMRR}` : ""}
${targetFunding ? `Funding Target: $${targetFunding}` : ""}

Generate:
1. Key Financial Assumptions (pricing, growth rate, CAC, LTV, churn)
2. 3-Year P&L Projection (Year 1, 2, 3) in table format
3. Monthly Burn Rate and Runway Analysis
4. Revenue Milestones (when to hit $1M, $5M, $10M ARR)
5. Unit Economics (CAC, LTV, LTV:CAC ratio, payback period)
6. Funding Utilization Plan (how $X will be spent month-by-month)
7. Break-even Analysis
8. Key metrics to track weekly/monthly

Use realistic growth rates for the Indian startup market. Mark assumptions clearly.`,
      },
    ], 3000);

    return res.status(200).json({ success: true, content, function: "financial_projection" });
  } catch (error) {
    console.error("generateFinancialProjection error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 12D: PROPOSAL GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/grant-proposal
const generateGrantProposal = async (req, res) => {
  try {
    const { grantId, additionalContext } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    let grantContext = "Generic grant application";
    if (grantId) {
      const grant = await Grant.findById(grantId);
      if (grant) {
        grantContext = `Grant: ${grant.grantName}\nOrganization: ${grant.organization}\nRequirements: ${grant.eligibility}\nAmount: Up to $${grant.fundingAmountMax?.toLocaleString()}`;
      }
    }

    const content = await callGemini(req.user._id, "grant_proposal", [
      {
        role: "system",
        content: "You are an expert grant proposal writer who has secured over $50M in grant funding for Indian startups. You write compelling, specific, and impact-focused proposals that win.",
      },
      {
        role: "user",
        content: `Write a complete grant proposal for this startup:

STARTUP:
${context}

GRANT:
${grantContext}

${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Write a complete proposal including:
1. Executive Summary (1 page — compelling, specific, impact-focused)
2. Problem Statement (evidence-based, market data included)
3. Proposed Solution (specific, measurable, time-bound)
4. Impact Metrics (what will you achieve with this funding, by when)
5. Implementation Plan (quarter-by-quarter milestones)
6. Team Credentials (why you are the right team)
7. Budget Breakdown (how you'll use the grant money specifically)
8. Sustainability Plan (how the project continues after grant ends)
9. Evaluation Metrics (how success will be measured)

Use formal grant language. Be specific with numbers and timelines.`,
      },
    ], 4000);

    return res.status(200).json({ success: true, content, function: "grant_proposal" });
  } catch (error) {
    console.error("generateGrantProposal error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/investor-proposal
const generateInvestorProposal = async (req, res) => {
  try {
    const { investorId } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    let investorContext = "";
    if (investorId) {
      const inv = await InvestorProfile.findById(investorId)
        .populate("user", "name");
      if (inv) {
        investorContext = `\nTarget Investor: ${inv.firmName || inv.user?.name} (${inv.investorType})\nThesis: ${inv.industriesOfInterest?.join(", ")}\nPortfolio: ${inv.portfolioCompanies?.map(c => c.name).join(", ") || "Various"}`;
      }
    }

    const content = await callGemini(req.user._id, "investor_proposal", [
      {
        role: "system",
        content: "You are a fundraising expert who writes compelling investor proposals. You understand what VCs and angels look for and craft narratives that get term sheets.",
      },
      {
        role: "user",
        content: `Write a personalized investor proposal for this startup:

STARTUP:
${context}
${investorContext}

Generate:
1. One-Page Executive Summary (investor-ready)
2. Investment Thesis (why now, why us, why this market)
3. Deal Terms Overview (raising X at Y valuation, use of funds)
4. Traction Summary (key metrics, growth, proof points)
5. Why This Investor Specifically (thesis alignment, portfolio synergies)
6. Next Steps (what you're asking for — meeting, intro call, etc.)
7. Data Room Checklist (what documents to share)

Make it personalized, not generic. Reference the investor's portfolio/thesis if provided.`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "investor_proposal" });
  } catch (error) {
    console.error("generateInvestorProposal error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// POST /api/ai/partnership-proposal
const generatePartnershipProposal = async (req, res) => {
  try {
    const { partnerName, partnerType, proposalGoal } = req.body;
    const context = await getFounderContext(req.user._id);
    if (!context) {
      return res.status(404).json({ success: false, message: "Create your startup profile first." });
    }

    const content = await callGemini(req.user._id, "partnership_proposal", [
      {
        role: "system",
        content: "You are a business development expert who crafts compelling partnership proposals that create win-win outcomes for both parties.",
      },
      {
        role: "user",
        content: `Write a partnership proposal:

STARTUP:
${context}

PARTNER DETAILS:
Partner Name: ${partnerName || "Potential Partner"}
Partner Type: ${partnerType || "Technology/Business Partner"}
Partnership Goal: ${proposalGoal || "Strategic partnership for mutual growth"}

Generate:
1. Partnership Overview (what we're proposing, why now)
2. Value Proposition for Partner (what THEY get — be specific)
3. Value Proposition for Us (what we get)
4. Partnership Model Options (3 options from light to deep integration)
5. Implementation Timeline (30-60-90 day plan)
6. Revenue/Impact Projections (what this partnership unlocks)
7. Resource Requirements (what each party contributes)
8. Success Metrics (how we'll measure partnership success)
9. Proposed Next Steps

Make the partner's benefits clear and compelling. Lead with value for them.`,
      },
    ]);

    return res.status(200).json({ success: true, content, function: "partnership_proposal" });
  } catch (error) {
    console.error("generatePartnershipProposal error:", error);
    return res.status(500).json({ success: false, message: "AI service error." });
  }
};

// ─── USAGE STATS ──────────────────────────────────────────────────────────────
// GET /api/ai/usage
const getUsageStats = async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const limit      = Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 20;

    const [usedThisHour, usedToday, recentCalls] = await Promise.all([
      AIUsageLog.countDocuments({ user: req.user._id, createdAt: { $gte: oneHourAgo }, success: true }),
      AIUsageLog.countDocuments({ user: req.user._id, createdAt: { $gte: oneDayAgo },  success: true }),
      AIUsageLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    ]);

    return res.status(200).json({
      success: true,
      usage: {
        usedThisHour,
        remainingThisHour: Math.max(0, limit - usedThisHour),
        limitPerHour:      limit,
        usedToday,
        recentCalls,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  grantRecommendations,
  grantEligibilityCheck,
  applicationGuidance,
  investorRecommendations,
  fundraisingRoadmap,
  investorOutreachSuggestions,
  generateBusinessPlan,
  generatePitchDeckContent,
  generateFinancialProjection,
  generateGrantProposal,
  generateInvestorProposal,
  generatePartnershipProposal,
  getUsageStats,
};
