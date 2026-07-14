const { Router }  = require("express");
const { protect }        = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const aiRateLimit        = require("../middlewares/aiRateLimit");

// Controllers
const founderController = require("../controllers/ai.controller");
const investorController = require("../controllers/ai.investor.controller");
const incubatorController = require("../controllers/ai.incubator.controller");
const providerController = require("../controllers/ai.provider.controller");
const jobseekerController = require("../controllers/ai.jobseeker.controller");
const adminController = require("../controllers/ai.admin.controller");

const router = Router();

// ── USAGE ───────────────────────────────────────────────
router.get("/usage", protect, founderController.getUsageStats);

// ── ROLE: FOUNDER ───────────────────────────────────────
const founderAuth = [protect, authorizeRoles("founder"), aiRateLimit];
router.post("/grant-recommendations",    ...founderAuth, founderController.grantRecommendations);
router.post("/grant-eligibility-check",  ...founderAuth, founderController.grantEligibilityCheck);
router.post("/application-guidance",     ...founderAuth, founderController.applicationGuidance);
router.post("/investor-recommendations", ...founderAuth, founderController.investorRecommendations);
router.post("/fundraising-roadmap",      ...founderAuth, founderController.fundraisingRoadmap);
router.post("/outreach-suggestions",     ...founderAuth, founderController.investorOutreachSuggestions);
router.post("/business-plan",            ...founderAuth, founderController.generateBusinessPlan);
router.post("/pitch-deck-content",       ...founderAuth, founderController.generatePitchDeckContent);
router.post("/financial-projection",     ...founderAuth, founderController.generateFinancialProjection);
router.post("/grant-proposal",           ...founderAuth, founderController.generateGrantProposal);
router.post("/investor-proposal",        ...founderAuth, founderController.generateInvestorProposal);
router.post("/partnership-proposal",     ...founderAuth, founderController.generatePartnershipProposal);

// ── ROLE: INVESTOR ──────────────────────────────────────
const investorAuth = [protect, authorizeRoles("investor"), aiRateLimit];
router.post("/investor/due-diligence",   ...investorAuth, investorController.analyzeDueDiligence);
router.post("/investor/deal-memo",       ...investorAuth, investorController.generateDealMemo);
router.post("/investor/startup-score",   ...investorAuth, investorController.scoreStartup);
router.post("/investor/competitive-map", ...investorAuth, investorController.mapCompetitors);
router.post("/investor/portfolio-risk",  ...investorAuth, investorController.assessPortfolioRisk);
router.post("/investor/follow-on-advice",...investorAuth, investorController.adviseFollowOn);
router.post("/investor/thesis-refiner",  ...investorAuth, investorController.refineThesis);
router.post("/investor/term-sheet",      ...investorAuth, investorController.draftTermSheet);
router.post("/investor/rejection-email", ...investorAuth, investorController.draftRejectionEmail);
router.post("/investor/lp-update",       ...investorAuth, investorController.writeLPUpdate);

// ── ROLE: INCUBATOR ─────────────────────────────────────
const incubatorAuth = [protect, authorizeRoles("incubator"), aiRateLimit];
router.post("/incubator/curriculum",         ...incubatorAuth, incubatorController.generateCurriculum);
router.post("/incubator/score-applicants",   ...incubatorAuth, incubatorController.scoreApplicant);
router.post("/incubator/diversity-check",    ...incubatorAuth, incubatorController.analyzeDiversity);
router.post("/incubator/demo-day-script",    ...incubatorAuth, incubatorController.writeDemoDayScript);
router.post("/incubator/mentor-match",       ...incubatorAuth, incubatorController.matchMentors);
router.post("/incubator/progress-report",    ...incubatorAuth, incubatorController.generateProgressReport);
router.post("/incubator/grant-apply",        ...incubatorAuth, incubatorController.applyForGrant);
router.post("/incubator/equity-agreement",   ...incubatorAuth, incubatorController.draftEquityAgreement);
router.post("/incubator/sponsor-pitch",      ...incubatorAuth, incubatorController.writeSponsorPitch);

// ── ROLE: SERVICE PROVIDER ──────────────────────────────
const providerAuth = [protect, authorizeRoles("service_provider"), aiRateLimit];
router.post("/provider/proposal-writer",     ...providerAuth, providerController.writeProposal);
router.post("/provider/cold-outreach",       ...providerAuth, providerController.generateColdOutreach);
router.post("/provider/listing-optimizer",   ...providerAuth, providerController.optimizeListing);
router.post("/provider/sla-generator",       ...providerAuth, providerController.generateSLA);
router.post("/provider/nda-drafter",         ...providerAuth, providerController.draftNDA);
router.post("/provider/invoice-generator",   ...providerAuth, providerController.generateInvoice);
router.post("/provider/pricing-advisor",     ...providerAuth, providerController.advisePricing);
router.post("/provider/review-response",     ...providerAuth, providerController.writeReviewResponse);

// ── ROLE: JOB SEEKER ────────────────────────────────────
const jobseekerAuth = [protect, authorizeRoles("job_seeker"), aiRateLimit];
router.post("/jobseeker/resume-optimizer",   ...jobseekerAuth, jobseekerController.optimizeResume);
router.post("/jobseeker/cover-letter",       ...jobseekerAuth, jobseekerController.generateCoverLetter);
router.post("/jobseeker/job-match",          ...jobseekerAuth, jobseekerController.analyzeJobMatch);
router.post("/jobseeker/interview-prep",     ...jobseekerAuth, jobseekerController.prepInterview);
router.post("/jobseeker/career-roadmap",     ...jobseekerAuth, jobseekerController.buildCareerRoadmap);
router.post("/jobseeker/salary-negotiation", ...jobseekerAuth, jobseekerController.coachSalaryNegotiation);
router.post("/jobseeker/linkedin-optimizer", ...jobseekerAuth, jobseekerController.optimizeLinkedIn);

// ── ROLE: ADMIN ─────────────────────────────────────────
const adminAuth = [protect, authorizeRoles("super_admin"), aiRateLimit];
router.post("/admin/health-report",          ...adminAuth, adminController.generateHealthReport);
router.post("/admin/fraud-detection",        ...adminAuth, adminController.detectFraud);
router.post("/admin/moderate-content",       ...adminAuth, adminController.moderateContent);
router.post("/admin/curate-grant",           ...adminAuth, adminController.curateGrant);
router.post("/admin/verify-investor",        ...adminAuth, adminController.verifyInvestor);

module.exports = router;
