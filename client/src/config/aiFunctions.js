import {
  Lightbulb, TrendingUp, PenTool, FileText,
  Search, Briefcase, FileCode, Users,
  BarChart2, ShieldAlert, Monitor, CheckCircle
} from 'lucide-react';

export const AI_FUNCTIONS_BY_ROLE = {
  founder: [
    {
      group: 'Grant Assistant',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: Lightbulb,
      items: [
        { id: 'grant-recommendations', label: 'Grant Recommendations', endpoint: '/ai/grant-recommendations', desc: 'Get AI-matched grants based on your startup profile', prompt: 'Analyzing your startup profile to find the best matching grants...' },
        { id: 'grant-eligibility-check', label: 'Eligibility Check', endpoint: '/ai/grant-eligibility-check', desc: 'Criteria breakdown for grants', prompt: 'Checking eligibility...', hasInput: true, inputLabel: 'Enter Grant Name or URL', inputKey: 'grantName' },
        { id: 'application-guidance', label: 'Application Guidance', endpoint: '/ai/application-guidance', desc: 'Step-by-step guidance for applications', prompt: 'Generating application strategy...' },
      ],
    },
    {
      group: 'Fundraising Assistant',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      icon: TrendingUp,
      items: [
        { id: 'investor-recommendations', label: 'Investor Recommendations', endpoint: '/ai/investor-recommendations', desc: 'AI-matched investors', prompt: 'Analyzing investor database...' },
        { id: 'fundraising-roadmap', label: 'Fundraising Roadmap', endpoint: '/ai/fundraising-roadmap', desc: '6-12 month step-by-step plan', prompt: 'Creating roadmap...' },
        { id: 'outreach-suggestions', label: 'Outreach Templates', endpoint: '/ai/outreach-suggestions', desc: 'Cold email & LinkedIn templates', prompt: 'Drafting templates...' },
      ],
    },
    {
      group: 'Generators',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: PenTool,
      items: [
        { id: 'business-plan', label: 'Business Plan', endpoint: '/ai/business-plan', desc: 'Generate a full business plan', prompt: 'Drafting business plan...' },
        { id: 'pitch-deck', label: 'Pitch Deck Content', endpoint: '/ai/pitch-deck-content', desc: 'Slide-by-slide pitch content', prompt: 'Structuring pitch deck...' },
        { id: 'financial-projection', label: 'Financial Projections', endpoint: '/ai/financial-projection', desc: 'Generate 3-year projections', prompt: 'Calculating projections...' },
      ],
    }
  ],
  investor: [
    {
      group: 'Due Diligence Tools',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: Search,
      items: [
        { id: 'due-diligence', label: 'DD Analyzer', endpoint: '/ai/investor/due-diligence', desc: 'Upload data room info for risk flags', prompt: 'Analyzing data room...', hasInput: true, inputLabel: 'Paste Startup Data Room Info', inputKey: 'startupData' },
        { id: 'deal-memo', label: 'Deal Memo Generator', endpoint: '/ai/investor/deal-memo', desc: 'Auto-draft IC memos', prompt: 'Drafting Deal Memo...', hasInput: true, inputLabel: 'Paste Startup Summary', inputKey: 'startupContextStr' },
        { id: 'startup-score', label: 'Startup Scoring', endpoint: '/ai/investor/startup-score', desc: 'Score startups 1-100', prompt: 'Calculating score...', hasInput: true, inputLabel: 'Paste Startup Details', inputKey: 'startupContextStr' },
        { id: 'competitive-map', label: 'Competitive Map', endpoint: '/ai/investor/competitive-map', desc: 'Map competitors and TAM', prompt: 'Mapping landscape...', hasInput: true, inputLabel: 'Paste Startup Name/Details', inputKey: 'startupContextStr' },
      ],
    },
    {
      group: 'Portfolio Intelligence',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: BarChart2,
      items: [
        { id: 'portfolio-risk', label: 'Portfolio Risk Assessor', endpoint: '/ai/investor/portfolio-risk', desc: 'Identify exposure risks', prompt: 'Assessing portfolio risk...' },
        { id: 'follow-on', label: 'Follow-on Advisor', endpoint: '/ai/investor/follow-on-advice', desc: 'Traction signal analysis', prompt: 'Analyzing signals...', hasInput: true, inputLabel: 'Paste Company Update', inputKey: 'companyUpdate' },
        { id: 'thesis-refiner', label: 'Thesis Refiner', endpoint: '/ai/investor/thesis-refiner', desc: 'Suggest thesis refinements', prompt: 'Analyzing trends...' },
      ],
    },
    {
      group: 'Communication',
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      icon: FileText,
      items: [
        { id: 'term-sheet', label: 'Term Sheet Drafter', endpoint: '/ai/investor/term-sheet', desc: 'Draft SAFE or Equity terms', prompt: 'Drafting term sheet...', hasInput: true, inputLabel: 'Enter Valuation, Equity %, Key Terms', inputKey: 'keyTerms' },
        { id: 'rejection-email', label: 'Rejection Email', endpoint: '/ai/investor/rejection-email', desc: 'Constructive pass emails', prompt: 'Drafting email...', hasInput: true, inputLabel: 'Enter Startup Name & Reason', inputKey: 'reason' },
        { id: 'lp-update', label: 'LP Update Writer', endpoint: '/ai/investor/lp-update', desc: 'Quarterly LP emails', prompt: 'Drafting LP update...', hasInput: true, inputLabel: 'Enter Portfolio Highlights', inputKey: 'updates' },
      ],
    }
  ],
  incubator: [
    {
      group: 'Cohort Management',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: Users,
      items: [
        { id: 'curriculum', label: 'Curriculum Generator', endpoint: '/ai/incubator/curriculum', desc: '12-week syllabus generation', prompt: 'Designing curriculum...', hasInput: true, inputLabel: 'Enter Cohort Focus (e.g. Web3)', inputKey: 'focus' },
        { id: 'score-applicants', label: 'Applicant Scorer', endpoint: '/ai/incubator/score-applicants', desc: 'Score startup applications', prompt: 'Scoring application...', hasInput: true, inputLabel: 'Paste Application Data', inputKey: 'applicationData' },
        { id: 'diversity', label: 'Diversity Analyzer', endpoint: '/ai/incubator/diversity-check', desc: 'Identify cohort gaps', prompt: 'Analyzing diversity...', hasInput: true, inputLabel: 'Paste Accepted Cohort Data', inputKey: 'cohortData' },
      ],
    },
    {
      group: 'Program Tools',
      color: 'text-pink-500',
      bg: 'bg-pink-50',
      border: 'border-pink-100',
      icon: FileCode,
      items: [
        { id: 'demo-day', label: 'Demo Day Script', endpoint: '/ai/incubator/demo-day-script', desc: 'Pitch scripts for startups', prompt: 'Writing script...', hasInput: true, inputLabel: 'Paste Startup Info', inputKey: 'startupInfo' },
        { id: 'mentor-match', label: 'Mentor Matcher', endpoint: '/ai/incubator/mentor-match', desc: 'Match startups with mentors', prompt: 'Finding mentors...', hasInput: true, inputLabel: 'Enter Startup Weaknesses & Mentor List', inputKey: 'mentorsList' },
        { id: 'progress-report', label: 'Progress Report', endpoint: '/ai/incubator/progress-report', desc: 'Monthly sponsor reports', prompt: 'Generating report...', hasInput: true, inputLabel: 'Paste Milestone Updates', inputKey: 'milestones' },
      ],
    },
    {
      group: 'Operations',
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-100',
      icon: CheckCircle,
      items: [
        { id: 'grant-apply', label: 'Grant Assistant', endpoint: '/ai/incubator/grant-apply', desc: 'Apply for Govt incubator grants', prompt: 'Drafting grant...', hasInput: true, inputLabel: 'Paste Grant Details', inputKey: 'grantDetails' },
        { id: 'equity', label: 'Equity Agreement', endpoint: '/ai/incubator/equity-agreement', desc: 'Draft incubation terms', prompt: 'Drafting agreement...', hasInput: true, inputLabel: 'Enter Program Terms', inputKey: 'terms' },
        { id: 'sponsor-pitch', label: 'Sponsor Pitch', endpoint: '/ai/incubator/sponsor-pitch', desc: 'Corporate sponsor decks', prompt: 'Writing pitch...', hasInput: true, inputLabel: 'Paste Cohort Stats', inputKey: 'cohortStats' },
      ],
    }
  ],
  service_provider: [
    {
      group: 'Client Acquisition',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      icon: Briefcase,
      items: [
        { id: 'proposal', label: 'Proposal Writer', endpoint: '/ai/provider/proposal-writer', desc: 'Draft tailored SOW proposals', prompt: 'Drafting proposal...', hasInput: true, inputLabel: 'Paste Job Posting', inputKey: 'jobPosting' },
        { id: 'cold-outreach', label: 'Cold Outreach', endpoint: '/ai/provider/cold-outreach', desc: 'Personalized founder outreach', prompt: 'Drafting outreach...', hasInput: true, inputLabel: 'Paste Startup Profile', inputKey: 'startupProfile' },
        { id: 'listing-opt', label: 'Listing Optimizer', endpoint: '/ai/provider/listing-optimizer', desc: 'A/B test service listings', prompt: 'Optimizing listing...', hasInput: true, inputLabel: 'Paste Current Listing', inputKey: 'currentListing' },
      ],
    },
    {
      group: 'Legal & Contracts',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      icon: FileText,
      items: [
        { id: 'sla', label: 'SLA Generator', endpoint: '/ai/provider/sla-generator', desc: 'Draft service level agreements', prompt: 'Generating SLA...', hasInput: true, inputLabel: 'Enter Service Details', inputKey: 'slaDetails' },
        { id: 'nda', label: 'NDA Drafter', endpoint: '/ai/provider/nda-drafter', desc: 'Bilateral Indian NDAs', prompt: 'Drafting NDA...', hasInput: true, inputLabel: 'Enter Party Details', inputKey: 'partyDetails' },
        { id: 'invoice', label: 'Invoice Generator', endpoint: '/ai/provider/invoice-generator', desc: 'GST-compliant invoices', prompt: 'Generating invoice...', hasInput: true, inputLabel: 'Enter Project Details', inputKey: 'projectDetails' },
      ],
    },
    {
      group: 'Business Growth',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      border: 'border-amber-200',
      icon: TrendingUp,
      items: [
        { id: 'pricing', label: 'Pricing Advisor', endpoint: '/ai/provider/pricing-advisor', desc: 'Optimal pricing tiers', prompt: 'Analyzing pricing...', hasInput: true, inputLabel: 'Enter Your Services & Market Data', inputKey: 'marketData' },
        { id: 'review', label: 'Review Response', endpoint: '/ai/provider/review-response', desc: 'Professional review replies', prompt: 'Drafting response...', hasInput: true, inputLabel: 'Paste Client Review', inputKey: 'clientReview' },
      ],
    }
  ],
  job_seeker: [
    {
      group: 'Application Tools',
      color: 'text-teal-500',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      icon: FileText,
      items: [
        { id: 'resume', label: 'Resume Optimizer', endpoint: '/ai/jobseeker/resume-optimizer', desc: 'ATS keyword optimization', prompt: 'Optimizing resume...', hasInput: true, inputLabel: 'Paste Resume & Job Description', inputKey: 'resume' },
        { id: 'cover-letter', label: 'Cover Letter', endpoint: '/ai/jobseeker/cover-letter', desc: 'Personalized cover letters', prompt: 'Drafting letter...', hasInput: true, inputLabel: 'Paste Job Posting', inputKey: 'jobPosting' },
        { id: 'job-match', label: 'Job Match Analyzer', endpoint: '/ai/jobseeker/job-match', desc: 'Gap analysis for roles', prompt: 'Analyzing match...', hasInput: true, inputLabel: 'Enter Skills & Job Reqs', inputKey: 'mySkills' },
        { id: 'interview', label: 'Interview Prep', endpoint: '/ai/jobseeker/interview-prep', desc: 'Startup interview questions', prompt: 'Generating questions...', hasInput: true, inputLabel: 'Paste Role Details', inputKey: 'roleDetails' },
      ],
    },
    {
      group: 'Career Development',
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      border: 'border-cyan-200',
      icon: TrendingUp,
      items: [
        { id: 'roadmap', label: 'Career Roadmap', endpoint: '/ai/jobseeker/career-roadmap', desc: '12-month learning plan', prompt: 'Building roadmap...', hasInput: true, inputLabel: 'Enter Current Role & Target Role', inputKey: 'currentRole' },
        { id: 'salary', label: 'Salary Coach', endpoint: '/ai/jobseeker/salary-negotiation', desc: 'Negotiation scripts', prompt: 'Coaching negotiation...', hasInput: true, inputLabel: 'Paste Offer Details', inputKey: 'offerDetails' },
        { id: 'linkedin', label: 'LinkedIn Optimizer', endpoint: '/ai/jobseeker/linkedin-optimizer', desc: 'Attract startup recruiters', prompt: 'Optimizing profile...', hasInput: true, inputLabel: 'Paste Current Profile', inputKey: 'currentProfile' },
      ],
    }
  ],
  super_admin: [
    {
      group: 'Platform Intelligence',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      icon: Monitor,
      items: [
        { id: 'health', label: 'Health Report', endpoint: '/ai/admin/health-report', desc: 'Executive platform trends', prompt: 'Generating report...', hasInput: true, inputLabel: 'Paste Platform Stats', inputKey: 'platformStats' },
        { id: 'fraud', label: 'Fraud Detection', endpoint: '/ai/admin/fraud-detection', desc: 'Scan user registrations', prompt: 'Scanning for fraud...', hasInput: true, inputLabel: 'Paste Recent Registrations', inputKey: 'userRegistrations' },
        { id: 'moderation', label: 'Content Moderation', endpoint: '/ai/admin/moderate-content', desc: 'Review flagged posts', prompt: 'Reviewing content...', hasInput: true, inputLabel: 'Paste Flagged Posts', inputKey: 'flaggedPosts' },
        { id: 'curate-grant', label: 'Grant Curation', endpoint: '/ai/admin/curate-grant', desc: 'Extract JSON from grant text', prompt: 'Extracting data...', hasInput: true, inputLabel: 'Paste Raw Grant Announcement', inputKey: 'rawGrantData' },
        { id: 'verify', label: 'Investor Verify', endpoint: '/ai/admin/verify-investor', desc: 'Cross-check credentials', prompt: 'Verifying investor...', hasInput: true, inputLabel: 'Paste Profile & LinkedIn', inputKey: 'investorProfile' },
      ],
    }
  ]
};
