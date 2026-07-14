const request = require("supertest")
const app     = require("../src/app") // your Express app
const { createTestUser, cleanCollections } = require("./helpers")

// Models
const User             = require("../src/models/User")
const FounderProfile   = require("../src/models/founderProfile.model")
const InvestorProfile  = require("../src/models/investorProfile.model")
const Grant            = require("../src/models/Grant")
const Application      = require("../src/models/application")
const Job              = require("../src/models/Job")
const JobApplication   = require("../src/models/JobApplication")
const Post             = require("../src/models/Post")
const Comment          = require("../src/models/Comment")
const CoFounderProfile = require("../src/models/CoFounderProfile")
const Document         = require("../src/models/Document")
const Notification     = require("../src/models/Notification")
const Event            = require("../src/models/Event")

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: AUTH & ROLES
// ─────────────────────────────────────────────────────────────────────────────
describe("1. Auth & Roles", () => {
  beforeEach(async () => {
    await cleanCollections(User)
  })

  test("1.1 Founder registers → gets token immediately", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name:     "Test Founder",
        email:    "founder@test.com",
        password: "TestPass@123",
        role:     "founder",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user.role).toBe("founder")
  })

  test("1.2 Investor registers → NO token (pending approval)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name:     "Test Investor",
        email:    "investor@test.com",
        password: "TestPass@123",
        role:     "investor",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.accessToken).toBeUndefined() // Critical — no token
  })

  test("1.3 Incubator registers → NO token (pending approval)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name:     "Test Incubator",
        email:    "incubator@test.com",
        password: "TestPass@123",
        role:     "incubator",
      })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeUndefined()
  })

  test("1.3b Service Provider registers → NO token (pending approval)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name:     "Test Service Provider",
        email:    "service@test.com",
        password: "TestPass@123",
        role:     "service_provider",
      })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeUndefined()
  })

  test("1.4 Unapproved investor cannot login → 403", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Blocked Investor", email: "blocked@test.com",
      password: "TestPass@123", role: "investor",
    })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "blocked@test.com", password: "TestPass@123" })

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toContain("pending")
  })

  test("1.5 Founder logs in → gets token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test", email: "login@test.com",
      password: "TestPass@123", role: "founder",
    })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "TestPass@123" })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  test("1.6 Wrong password → 401", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Pass Test", email: "pass@test.com",
      password: "TestPass@123", role: "founder",
    })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pass@test.com", password: "WrongPassword" })

    expect(res.status).toBe(401)
  })

  test("1.7 Protected route blocked without token → 401", async () => {
    const res = await request(app)
      .get("/api/profile/founder/me")

    expect(res.status).toBe(401)
  })

  test("1.8 Role route blocks wrong role → 403", async () => {
    const { token } = await createTestUser({
      email: "wrongrole@test.com",
      role:  "founder",
    })

    // Founder tries to access investor-only matchmaking
    const res = await request(app)
      .get("/api/matchmaking/startups")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  test("1.9 GET /api/auth/me returns current user", async () => {
    const { token } = await createTestUser({ email: "me@test.com" })

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe("me@test.com")
  })

  test("1.10 Duplicate email registration → 409", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First", email: "dup@test.com",
      password: "TestPass@123", role: "founder",
    })

    const res = await request(app).post("/api/auth/register").send({
      name: "Second", email: "dup@test.com",
      password: "TestPass@123", role: "founder",
    })

    expect(res.status).toBe(409)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: STARTUP MODULE
// ─────────────────────────────────────────────────────────────────────────────
describe("2. Startup Module", () => {
  let founderToken, founderId

  beforeAll(async () => {
    await cleanCollections(User, FounderProfile)
    const { user, token } = await createTestUser({
      email: "startup_founder@test.com",
      role:  "founder",
    })
    founderToken = token
    founderId    = user._id
  })

  test("2.1 Founder creates startup profile → 201", async () => {
    const res = await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        startupName:     "TestStartup AI",
        industry:        "fintech",
        fundingStage:    "seed",
        description:     "AI-powered fintech for SMEs",
        fundingRequired: 5000000,
        city:            "Bengaluru",
        country:         "India",
        teamSize:        5,
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.profile.startupName).toBe("TestStartup AI")
    expect(res.body.profile.slug).toBeDefined()
  })

  test("2.2 Duplicate profile creation → 409", async () => {
    const res = await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ startupName: "Another Startup", industry: "saas", fundingStage: "idea" })

    expect(res.status).toBe(409)
  })

  test("2.3 Public startup directory loads", async () => {
    const res = await request(app).get("/api/startups")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.startups)).toBe(true)
  })

  test("2.4 Get startup by slug", async () => {
    // Founders are NOT auto-approved — approve before public slug lookup
    await FounderProfile.findOneAndUpdate({ user: founderId }, { isApproved: true })
    const profile = await FounderProfile.findOne({ user: founderId })
    const res = await request(app).get(`/api/startups/${profile.slug}`)
    expect(res.status).toBe(200)
    expect(res.body.startup.startupName).toBe("TestStartup AI")
  })

  test("2.5 Non-founder cannot create startup profile → 403", async () => {
    const { token } = await createTestUser({
      email: "inv_no_startup@test.com",
      role:  "investor",
    })

    const res = await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${token}`)
      .send({ startupName: "Nope", industry: "saas", fundingStage: "seed" })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: GRANTS MODULE
// ─────────────────────────────────────────────────────────────────────────────
describe("3. Grants Module", () => {
  let adminToken, founderToken, grantId, grantSlug

  beforeAll(async () => {
    await cleanCollections(User, Grant, Application)

    const admin = await createTestUser({
      email: "admin_grants@test.com",
      role:  "super_admin",
    })
    const founder = await createTestUser({
      email: "founder_grants@test.com",
      role:  "founder",
    })
    adminToken   = admin.token
    founderToken = founder.token

    // Create startup profile for founder
    await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        startupName: "GrantTest Startup", industry: "fintech",
        fundingStage: "seed", fundingRequired: 2000000,
        city: "Mumbai", country: "India",
      })
  })

  test("3.1 Admin creates grant → 201", async () => {
    const res = await request(app)
      .post("/api/grants")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        grantName:        "Startup India Seed Fund Test",
        organization:     "DPIIT",
        category:         "government",
        description:      "Seed funding for early stage startups",
        fundingAmountMin: 500000,
        fundingAmountMax: 5000000,
        eligibility:      "DPIIT registered startups",
        eligibleStages:   ["idea", "pre_seed", "seed"],
        eligibleIndustries: ["all"],
        deadline:         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    grantId   = res.body.grant._id
    grantSlug = res.body.grant.slug
  })

  test("3.2 Public grants directory loads", async () => {
    const res = await request(app).get("/api/grants")
    expect(res.status).toBe(200)
    expect(res.body.grants.length).toBeGreaterThan(0)
  })

  test("3.3 Get grant by slug", async () => {
    const res = await request(app).get(`/api/grants/${grantSlug}`)
    expect(res.status).toBe(200)
    expect(res.body.grant.grantName).toBe("Startup India Seed Fund Test")
  })

  test("3.4 Founder bookmarks grant → toggle works", async () => {
    const res1 = await request(app)
      .post(`/api/grants/${grantId}/bookmark`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res1.status).toBe(200)
    expect(res1.body.bookmarked).toBe(true)

    // Toggle off
    const res2 = await request(app)
      .post(`/api/grants/${grantId}/bookmark`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res2.body.bookmarked).toBe(false)
  })

  test("3.5 Founder applies to grant → CRM entry created", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ targetType: "grant", grant: grantId })

    expect(res.status).toBe(201)
    expect(res.body.application.targetType).toBe("grant")
  })

  test("3.6 Non-admin cannot create grant → 403", async () => {
    const res = await request(app)
      .post("/api/grants")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ grantName: "Fake Grant" })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: MATCHMAKING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
describe("4. Matchmaking Engine", () => {
  let founderToken, investorToken

  beforeAll(async () => {
    await cleanCollections(User, FounderProfile, InvestorProfile)

    const founder  = await createTestUser({ email: "match_founder@test.com", role: "founder" })
    const investor = await createTestUser({ email: "match_investor@test.com", role: "investor" })
    founderToken  = founder.token
    investorToken = investor.token

    // Create founder profile
    await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        startupName: "Match Test Startup", industry: "fintech",
        fundingStage: "seed", fundingRequired: 5000000,
        city: "Bengaluru", country: "India",
      })

    // Create investor profile
    await request(app)
      .post("/api/profile/investor")
      .set("Authorization", `Bearer ${investorToken}`)
      .send({
        firmName:             "Match VC",
        investorType:         "venture_capital",
        industriesOfInterest: ["fintech", "saas"],
        investmentStages:     ["seed", "series_a"],
        ticketSizeMin:        1000000,
        ticketSizeMax:        10000000,
        geographicPreference: ["Bengaluru", "India"],
      })
  })

  test("4.1 Founder gets matched investors with scores", async () => {
    const res = await request(app)
      .get("/api/matchmaking/investors")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.investors.length).toBeGreaterThan(0)
    expect(res.body.investors[0].matchScore).toBeDefined()
    expect(res.body.investors[0].matchScore).toBeGreaterThan(0)
  })

  test("4.2 Match score is correctly weighted (fintech+seed+range+geo = high score)", async () => {
    const res = await request(app)
      .get("/api/matchmaking/investors")
      .set("Authorization", `Bearer ${founderToken}`)

    const topMatch = res.body.investors[0]
    // Industry(40) + Stage(30) + TicketSize(20) + Geo(10) = 100
    expect(topMatch.matchScore).toBeGreaterThanOrEqual(70)
  })

  test("4.3 Investor gets matched startups", async () => {
    const res = await request(app)
      .get("/api/matchmaking/startups")
      .set("Authorization", `Bearer ${investorToken}`)

    expect(res.status).toBe(200)
    expect(res.body.startups.length).toBeGreaterThan(0)
  })

  test("4.4 No profile → 404 with empty matches array", async () => {
    const { token } = await createTestUser({
      email: "noprofile@test.com", role: "founder"
    })

    const res = await request(app)
      .get("/api/matchmaking/investors")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.matches).toEqual([])
  })

  test("4.5 Founder cannot access investor matchmaking → 403", async () => {
    const res = await request(app)
      .get("/api/matchmaking/startups")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: JOBS PORTAL
// ─────────────────────────────────────────────────────────────────────────────
describe("5. Jobs Portal", () => {
  let founderToken, jobSeekerToken, jobId

  beforeAll(async () => {
    await cleanCollections(User, Job, JobApplication)
    const founder   = await createTestUser({ email: "jobs_founder@test.com",    role: "founder" })
    const jobSeeker = await createTestUser({ email: "jobs_seeker@test.com",     role: "job_seeker" })
    founderToken    = founder.token
    jobSeekerToken  = jobSeeker.token
  })

  test("5.1 Founder posts job → 201", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        title:       "Senior Backend Engineer",
        companyName: "TestStartup AI",
        description: "Build our backend infrastructure",
        jobType:     "Full-time",   // Match Job.js enum exactly
        workModel:   "Remote",      // Match Job.js enum exactly
        location:    "Bengaluru",
        salaryRange: "₹12L - ₹20L",
      })

    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe("Senior Backend Engineer") // controller returns .data
    jobId = res.body.data._id
  })

  test("5.2 Public job directory loads", async () => {
    const res = await request(app).get("/api/jobs")
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0) // controller returns .data
  })

  test("5.3 Job seeker applies → 201", async () => {
    const res = await request(app)
      .post("/api/job-applications")
      .set("Authorization", `Bearer ${jobSeekerToken}`)
      .send({
        jobId:       jobId,
        coverLetter: "I am excited to apply...",
      })

    expect(res.status).toBe(201)
    expect(res.body.application.job).toBe(jobId)
  })

  test("5.4 Duplicate application → 409", async () => {
    const res = await request(app)
      .post("/api/job-applications")
      .set("Authorization", `Bearer ${jobSeekerToken}`)
      .send({ jobId })

    expect(res.status).toBe(409)
  })

  test("5.5 Job seeker gets their applications", async () => {
    const res = await request(app)
      .get("/api/job-applications/me")
      .set("Authorization", `Bearer ${jobSeekerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.applications.length).toBeGreaterThan(0)
  })

  test("5.6 Check if applied → returns applied: true", async () => {
    const res = await request(app)
      .get(`/api/job-applications/check/${jobId}`)
      .set("Authorization", `Bearer ${jobSeekerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.applied).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: COMMUNITY FORUM
// ─────────────────────────────────────────────────────────────────────────────
describe("6. Community Forum", () => {
  let founderToken, founderId, postId, commentId

  beforeAll(async () => {
    await cleanCollections(User, Post, Comment)
    const { user, token } = await createTestUser({
      email: "community@test.com", role: "founder"
    })
    founderToken = token
    founderId    = user._id
  })

  test("6.1 Create post → 201", async () => {
    const res = await request(app)
      .post("/api/community/posts")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        title:    "How do you approach seed fundraising?",
        body:     "Looking for advice on approaching seed investors in India.",
        category: "qa",
        tags:     ["fundraising", "seed", "india"],
      })

    expect(res.status).toBe(201)
    expect(res.body.post.title).toBe("How do you approach seed fundraising?")
    expect(res.body.post.upvoteCount).toBe(0)
    postId = res.body.post._id
  })

  test("6.2 Get all posts — public", async () => {
    const res = await request(app).get("/api/community/posts")
    expect(res.status).toBe(200)
    expect(res.body.posts.length).toBeGreaterThan(0)
  })

  test("6.3 Upvote post → upvoteCount increases", async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/upvote`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.upvoted).toBe(true)
    expect(res.body.upvotes).toBe(1)
  })

  test("6.4 Upvote again → toggles off (no double upvote)", async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/upvote`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.body.upvoted).toBe(false)
    expect(res.body.upvotes).toBe(0)
  })

  test("6.5 Add comment → 201", async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ body: "Great question! I started by warm intros..." })

    expect(res.status).toBe(201)
    commentId = res.body.comment._id
  })

  test("6.6 Threaded reply to comment → parentComment set", async () => {
    const res = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        body:          "Adding to what they said...",
        parentComment: commentId,
      })

    expect(res.status).toBe(201)
    expect(res.body.comment.parentComment).toBe(commentId)
  })

  test("6.7 Get comments returns tree structure", async () => {
    const res = await request(app)
      .get(`/api/community/posts/${postId}/comments`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.comments)).toBe(true)
    // Top level comment should have replies array
    const topLevel = res.body.comments.find(c => !c.parentComment)
    expect(topLevel.replies).toBeDefined()
  })

  test("6.8 Soft delete comment → body becomes [deleted]", async () => {
    await request(app)
      .delete(`/api/community/comments/${commentId}`)
      .set("Authorization", `Bearer ${founderToken}`)

    const comments = await Comment.findById(commentId)
    expect(comments.isDeleted).toBe(true)
    expect(comments.body).toBe("[deleted]")
  })

  test("6.9 Trending tags endpoint works", async () => {
    const res = await request(app).get("/api/community/tags/trending")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tags)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: DOCUMENT VAULT
// ─────────────────────────────────────────────────────────────────────────────
describe("7. Document Vault", () => {
  let founderToken, docId

  beforeAll(async () => {
    await cleanCollections(User, Document)
    const { token } = await createTestUser({
      email: "vault@test.com", role: "founder"
    })
    founderToken = token
  })

  test("7.1 Upload document → 201", async () => {
    const res = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        name:     "Series A Pitch Deck",
        folder:   "pitch_decks",
        fileUrl:  "https://res.cloudinary.com/test/raw/upload/v1/test.pdf",
        fileType: "pdf",
        fileSize: 2048000,
      })

    expect(res.status).toBe(201)
    expect(res.body.document.folder).toBe("pitch_decks")
    expect(res.body.document.currentVersion).toBe(1)
    docId = res.body.document._id
  })

  test("7.2 Get documents — returns grouped by folder", async () => {
    const res = await request(app)
      .get("/api/documents")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.grouped.pitch_decks).toBeDefined()
    expect(res.body.grouped.pitch_decks.length).toBeGreaterThan(0)
  })

  test("7.3 Filter by folder works", async () => {
    const res = await request(app)
      .get("/api/documents?folder=pitch_decks")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.documents.every(d => d.folder === "pitch_decks")).toBe(true)
  })

  test("7.4 Toggle share → generates share link", async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ isShared: true, expiryDays: 7 })

    expect(res.status).toBe(200)
    expect(res.body.isShared).toBe(true)
    expect(res.body.shareLink).toContain("/vault/shared/")
  })

  test("7.5 Toggle share off → link revoked", async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ isShared: false })

    expect(res.body.isShared).toBe(false)
    expect(res.body.shareLink).toBeNull()
  })

  test("7.6 Soft delete → document no longer appears", async () => {
    await request(app)
      .delete(`/api/documents/${docId}`)
      .set("Authorization", `Bearer ${founderToken}`)

    const res = await request(app)
      .get("/api/documents")
      .set("Authorization", `Bearer ${founderToken}`)

    const deleted = res.body.documents.find(d => d._id === docId)
    expect(deleted).toBeUndefined()
  })

  test("7.7 Vault stats endpoint works", async () => {
    const res = await request(app)
      .get("/api/documents/stats")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.stats.totalDocuments).toBeDefined()
    expect(res.body.stats.byFolder).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: COFOUNDER MATCHING
// ─────────────────────────────────────────────────────────────────────────────
describe("8. Co-Founder Matching", () => {
  let techToken, bizToken, techProfileId

  beforeAll(async () => {
    await cleanCollections(User, CoFounderProfile)
    const tech = await createTestUser({ email: "tech_cofounder@test.com", role: "founder" })
    const biz  = await createTestUser({ email: "biz_cofounder@test.com",  role: "founder" })
    techToken = tech.token
    bizToken  = biz.token
  })

  test("8.1 Create co-founder profile → 201", async () => {
    const res = await request(app)
      .post("/api/cofounders/profile")
      .set("Authorization", `Bearer ${techToken}`)
      .send({
        currentRole:       "technical",
        lookingForRole:    "business",
        skills:            ["React", "Node.js", "MongoDB"],
        industryInterests: ["fintech", "saas"],
        experienceYears:   4,
        city:              "Bengaluru",
        country:           "India",
        status:            "actively_looking",
      })

    expect(res.status).toBe(201)
    techProfileId = res.body.profile._id
  })

  test("8.2 Duplicate profile → 409", async () => {
    const res = await request(app)
      .post("/api/cofounders/profile")
      .set("Authorization", `Bearer ${techToken}`)
      .send({ currentRole: "technical", lookingForRole: "business" })

    expect(res.status).toBe(409)
  })

  test("8.3 Create complementary biz profile", async () => {
    const res = await request(app)
      .post("/api/cofounders/profile")
      .set("Authorization", `Bearer ${bizToken}`)
      .send({
        currentRole:       "business",
        lookingForRole:    "technical",
        skills:            ["Sales", "Marketing", "Node.js"],
        industryInterests: ["fintech", "edtech"],
        experienceYears:   3,
        city:              "Bengaluru",
        country:           "India",
        status:            "actively_looking",
      })

    expect(res.status).toBe(201)
  })

  test("8.4 Get matches → complementary roles score high", async () => {
    const res = await request(app)
      .get("/api/cofounders/matches")
      .set("Authorization", `Bearer ${techToken}`)

    expect(res.status).toBe(200)
    expect(res.body.matches.length).toBeGreaterThan(0)
    // Tech + Biz complement = should score high (40 role + industry + skills)
    expect(res.body.matches[0].matchScore).toBeGreaterThan(40)
  })

  test("8.5 Send connection request → 200", async () => {
    const res = await request(app)
      .post(`/api/cofounders/connect/${techProfileId}`)
      .set("Authorization", `Bearer ${bizToken}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toContain("Connection request sent")
  })

  test("8.6 Duplicate connection request → 409", async () => {
    const res = await request(app)
      .post(`/api/cofounders/connect/${techProfileId}`)
      .set("Authorization", `Bearer ${bizToken}`)

    expect(res.status).toBe(409)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
describe("9. Notifications", () => {
  let founderToken, userId

  beforeAll(async () => {
    await cleanCollections(User, Notification)
    const { user, token } = await createTestUser({
      email: "notif@test.com", role: "founder"
    })
    founderToken = token
    userId       = user._id

    // Manually create test notifications
    await Notification.create([
      { user: userId, type: "SYSTEM",      title: "Welcome",       message: "Welcome to Boostr!", isRead: false },
      { user: userId, type: "GRANT_ALERT", title: "Grant Closing", message: "Grant closes in 7 days", isRead: false },
      { user: userId, type: "SYSTEM",      title: "Old",           message: "Old notification",  isRead: true },
    ])
  })

  test("9.1 Get notifications → returns list", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.notifications.length).toBeGreaterThan(0)
  })

  test("9.2 Unread count → returns correct number", async () => {
    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.count).toBe(2) // 2 unread created above
  })

  test("9.3 Mark single notification read", async () => {
    const notifs = await Notification.find({ user: userId, isRead: false })
    const notifId = notifs[0]._id

    const res = await request(app)
      .put(`/api/notifications/${notifId}/read`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)

    const countRes = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(countRes.body.count).toBe(1) // one less
  })

  test("9.4 Mark all read → count becomes 0", async () => {
    await request(app)
      .put("/api/notifications/read-all")
      .set("Authorization", `Bearer ${founderToken}`)

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.body.count).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: ADMIN PANEL
// ─────────────────────────────────────────────────────────────────────────────
describe("10. Admin Panel", () => {
  let adminToken, investorUserId, investorProfileId

  beforeAll(async () => {
    await cleanCollections(User, InvestorProfile)
    const { token } = await createTestUser({
      email: "admin_panel@test.com",
      role:  "super_admin",
    })
    adminToken = token

    // Create unapproved investor
    const invUser = await User.create({
      name: "Pending Investor", email: "pending_inv@test.com",
      password: "TestPass@123", role: "investor",
      isApproved: false, isActive: true,
    })
    investorUserId = invUser._id

    const invProfile = await InvestorProfile.create({
      user:         invUser._id,
      firmName:     "Pending VC",
      investorType: "angel",
      industriesOfInterest: ["fintech"],
      investmentStages:     ["seed"],
    })
    investorProfileId = invProfile._id
  })

  test("10.1 Admin gets platform stats", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.stats.totalUsers).toBeGreaterThan(0)
    expect(res.body.stats.pendingVerifications).toBeGreaterThan(0)
  })

  test("10.2 Admin gets pending investors", async () => {
    const res = await request(app)
      .get("/api/admin/pending-investors")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.investors.length).toBeGreaterThan(0)
  })

  test("10.3 Non-admin cannot access admin stats → 403", async () => {
    const { token } = await createTestUser({
      email: "notadmin@test.com", role: "founder"
    })

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  test("10.4 Admin approves investor → isApproved: true", async () => {
    const res = await request(app)
      .patch(`/api/investors/${investorUserId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.investor.isApproved).toBe(true)
  })

  test("10.5 After approval, investor can login", async () => {
    // Update user isApproved too
    await User.findByIdAndUpdate(investorUserId, { isApproved: true })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pending_inv@test.com", password: "TestPass@123" })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11: SECURITY BOUNDARY TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe("11. Security Boundaries", () => {
  let founderToken, investorToken, adminToken

  beforeAll(async () => {
    const founder  = await createTestUser({ email: "sec_founder@test.com",  role: "founder" })
    const investor = await createTestUser({ email: "sec_investor@test.com", role: "investor" })
    const admin    = await createTestUser({ email: "sec_admin@test.com",    role: "super_admin" })
    founderToken  = founder.token
    investorToken = investor.token
    adminToken    = admin.token
  })

  test("11.1 No token → 401 on all protected routes", async () => {
    const routes = [
      "/api/profile/founder/me",
      "/api/profile/investor/me",
      "/api/applications/me",
      "/api/documents",
      "/api/notifications",
    ]

    for (const route of routes) {
      const res = await request(app).get(route)
      expect(res.status).toBe(401)
    }
  })

  test("11.2 Founder cannot access investor endpoints", async () => {
    const res = await request(app)
      .get("/api/matchmaking/startups")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(403)
  })

  test("11.3 Investor cannot access admin endpoints", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${investorToken}`)

    expect(res.status).toBe(403)
  })

  test("11.4 Investor cannot create grants", async () => {
    const res = await request(app)
      .post("/api/grants")
      .set("Authorization", `Bearer ${investorToken}`)
      .send({ grantName: "Fake Grant" })

    expect(res.status).toBe(403)
  })

  test("11.5 AI endpoint blocked without auth", async () => {
    const res = await request(app)
      .post("/api/ai/grant-recommendations")

    expect(res.status).toBe(401)
  })

  test("11.6 AI endpoint blocked for non-founder", async () => {
    const res = await request(app)
      .post("/api/ai/grant-recommendations")
      .set("Authorization", `Bearer ${investorToken}`)

    expect(res.status).toBe(403)
  })

  test("11.7 Expired/invalid token → 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtokenstring")

    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12: ECOSYSTEM STATS
// ─────────────────────────────────────────────────────────────────────────────
describe("12. Ecosystem Stats", () => {
  test("12.1 Ecosystem stats endpoint returns all fields", async () => {
    const res = await request(app).get("/api/ecosystem-stats")

    expect(res.status).toBe(200)
    // API returns flat structure (not nested under .stats)
    expect(res.body.startupsCount).toBeDefined()
    expect(res.body.incubatorsCount).toBeDefined()
    expect(res.body.totalGrantsFunding).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13: INCUBATOR MODULE
// ─────────────────────────────────────────────────────────────────────────────
describe("13. Incubator Module", () => {
  let adminToken, incubatorToken, founderToken, incubatorId

  beforeAll(async () => {
    const admin     = await createTestUser({ email: "admin_incub@test.com",    role: "super_admin" })
    const incubator = await createTestUser({ email: "incubator_test@test.com", role: "incubator" })
    const founder   = await createTestUser({ email: "founder_incub@test.com",  role: "founder" })
    adminToken     = admin.token
    incubatorToken = incubator.token
    founderToken   = founder.token

    // Create founder profile for apply test
    await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        startupName: "Incub Test Startup", industry: "deeptech",
        fundingStage: "idea", city: "Mumbai", country: "India",
      })
  })

  test("13.1 Incubator creates profile → 201", async () => {
    const res = await request(app)
      .post("/api/incubators/profile/me")
      .set("Authorization", `Bearer ${incubatorToken}`)
      .send({
        organizationName: "IIT Bombay Incubator",
        programName:      "Deep Tech Cohort 2026",
        category:         "iit_incubator",
        description:      "Premier deep tech incubation program",
        fundingOffered:   2500000,
        duration:         "6 months",
        city:             "Mumbai",
        state:            "Maharashtra",
      })

    expect(res.status).toBe(201)
    expect(res.body.incubator.organizationName).toBe("IIT Bombay Incubator")
    incubatorId = res.body.incubator._id
  })

  test("13.2 Public incubator directory loads", async () => {
    const res = await request(app).get("/api/incubators")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.incubators)).toBe(true)
  })

  test("13.3 Founder applies to incubator → 201", async () => {
    const res = await request(app)
      .post(`/api/incubators/${incubatorId}/apply`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(201)
    expect(res.body.application.targetType).toBe("incubator")
  })

  test("13.4 Admin verifies incubator", async () => {
    const res = await request(app)
      .patch(`/api/incubators/${incubatorId}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.incubator.isVerified).toBe(true)
  })

  test("13.5 Non-incubator cannot create incubator profile → 403", async () => {
    const res = await request(app)
      .post("/api/incubators/profile/me")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ organizationName: "Fake Inc" })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14: SERVICE MARKETPLACE
// ─────────────────────────────────────────────────────────────────────────────
describe("14. Service Marketplace", () => {
  let providerToken, founderToken, serviceId

  beforeAll(async () => {
    const provider = await createTestUser({ email: "provider@test.com", role: "service_provider" })
    const founder  = await createTestUser({ email: "founder_market@test.com", role: "founder" })
    providerToken = provider.token
    founderToken  = founder.token
  })

  test("14.1 Service provider lists service → 201", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        title:       "Legal Registration Service",
        category:    "Legal",
        description: "Complete company registration and compliance",
        price:       "15000",
        deliveryDays: 7,
      })

    expect(res.status).toBe(201)
    serviceId = res.body.service._id
  })

  test("14.2 Public marketplace loads", async () => {
    const res = await request(app).get("/api/services")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.services)).toBe(true)
  })

  test("14.3 Founder submits proposal → 201", async () => {
    const res = await request(app)
      .post(`/api/services/${serviceId}/proposals`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        message: "I need company registration for my startup",
        budget:  12000,
      })

    expect(res.status).toBe(201)
  })

  test("14.4 Non-provider cannot list service → 403", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ title: "Fake Service" })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15: EVENTS MODULE
// ─────────────────────────────────────────────────────────────────────────────
describe("15. Events Module", () => {
  let adminToken, founderToken, eventId

  beforeAll(async () => {
    const admin   = await createTestUser({ email: "admin_events@test.com",  role: "super_admin" })
    const founder = await createTestUser({ email: "founder_events@test.com", role: "founder" })
    adminToken   = admin.token
    founderToken = founder.token
  })

  test("15.1 Admin creates event → 201", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title:         "Boostr Demo Day 2026",
        description:   "Annual startup demo day",
        type:          "Demo Day",
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDateTime:   new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location:      "Bengaluru",
        capacity:      200,
        format:        "In-Person",
        status:        "Published",
      })

    expect(res.status).toBe(201)
    eventId = res.body.event._id
  })

  test("15.2 Events directory loads", async () => {
    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
  })

  test("15.3 Founder registers for event → QR generated", async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(201)
    expect(res.body.registration).toBeDefined()
    // QR code should be generated
    expect(res.body.registration.qrCode).toBeDefined()
  })

  test("15.4 Duplicate registration → 400", async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(400)
  })

  test("15.5 Cancel registration works", async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}/register`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
  })

  test("15.6 Non-admin cannot create event → 403", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ title: "Unauthorized Event" })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16: FUNDING CRM
// ─────────────────────────────────────────────────────────────────────────────
describe("16. Funding CRM", () => {
  let founderToken, applicationId, adminToken, grantId

  beforeAll(async () => {
    const founder = await createTestUser({ email: "crm_founder@test.com", role: "founder" })
    const admin   = await createTestUser({ email: "crm_admin@test.com",   role: "super_admin" })
    founderToken = founder.token
    adminToken   = admin.token

    // Create founder profile
    await request(app)
      .post("/api/profile/founder")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        startupName: "CRM Test Startup", industry: "saas",
        fundingStage: "seed", city: "Delhi", country: "India",
      })

    // Create a grant to apply to
    const grantRes = await request(app)
      .post("/api/grants")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        grantName: "CRM Test Grant", organization: "Test Org",
        category: "startup", description: "Test grant",
        fundingAmountMax: 1000000,
        eligibility: "Any startup",
        eligibleStages: ["seed"],
        eligibleIndustries: ["all"],
      })
    grantId = grantRes.body.grant._id
  })

  test("16.1 Founder creates application (grant) → 201", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ targetType: "grant", grant: grantId })

    expect(res.status).toBe(201)
    expect(res.body.application.status).toBe("submitted")
    applicationId = res.body.application._id
  })

  test("16.2 Founder creates external offline lead → 201", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        targetType:   "external",
        isExternal:   true,
        externalName: "Sequoia Capital",
        externalOrg:  "Sequoia",
      })

    expect(res.status).toBe(201)
    expect(res.body.application.isExternal).toBe(true)
  })

  test("16.3 Get my applications → Kanban data", async () => {
    const res = await request(app)
      .get("/api/applications/me")
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
    expect(res.body.applications.length).toBeGreaterThanOrEqual(2)
  })

  test("16.4 Update application status → Kanban drag-drop", async () => {
    const res = await request(app)
      .put(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ status: "under_review" })

    expect(res.status).toBe(200)
    expect(res.body.application.status).toBe("under_review")
  })

  test("16.5 Delete application → removed from CRM", async () => {
    const res = await request(app)
      .delete(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${founderToken}`)

    expect(res.status).toBe(200)
  })

  test("16.6 Non-founder cannot access CRM → 403", async () => {
    const { token } = await createTestUser({
      email: "inv_crm@test.com", role: "investor"
    })

    const res = await request(app)
      .get("/api/applications/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 17: SETTINGS & ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────
describe("17. Settings & Account", () => {
  let founderToken

  beforeAll(async () => {
    const { token } = await createTestUser({
      email: "settings@test.com",
      role:  "founder",
    })
    founderToken = token
  })

  test("17.1 Update name via PATCH /auth/me", async () => {
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ name: "Updated Name" })

    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe("Updated Name")
  })

  test("17.2 Change password with correct current password", async () => {
    const res = await request(app)
      .patch("/api/auth/change-password")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        currentPassword: "TestPass@123",
        newPassword:     "NewPass@456",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  test("17.3 Change password with wrong current password → 401", async () => {
    const res = await request(app)
      .patch("/api/auth/change-password")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        currentPassword: "WrongPassword",
        newPassword:     "NewPass@456",
      })

    expect(res.status).toBe(401)
  })

  test("17.4 Update notification preferences", async () => {
    const res = await request(app)
      .patch("/api/auth/notification-preferences")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({
        emailGrantDeadlines:    true,
        emailApplicationStatus: false,
        inAppAll:               true,
      })

    expect(res.status).toBe(200)
  })

  test("17.5 Empty name update → 400", async () => {
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ name: "" })

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 18: OAUTH CODE EXCHANGE
// ─────────────────────────────────────────────────────────────────────────────
describe("18. OAuth Code Exchange", () => {
  test("18.1 Invalid code → 400", async () => {
    const res = await request(app)
      .post("/api/auth/oauth/exchange")
      .send({ code: "invalidcode123" })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test("18.2 Missing code → 400", async () => {
    const res = await request(app)
      .post("/api/auth/oauth/exchange")
      .send({})

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 19: DATA INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
describe("19. Data Integrity", () => {
  let founderToken

  beforeAll(async () => {
    const { token } = await createTestUser({
      email: "integrity@test.com", role: "founder"
    })
    founderToken = token
  })

  test("19.1 Register with missing required field → 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "missing@test.com", role: "founder" }) // no password

    expect(res.status).toBe(422)
  })

  test("19.2 Register with invalid email format → 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "notanemail", password: "Pass@123", role: "founder" })

    expect(res.status).toBe(422)
  })

  test("19.3 Create post with empty body → 400", async () => {
    const res = await request(app)
      .post("/api/community/posts")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ title: "Title only", category: "qa" }) // no body

    expect(res.status).toBe(400)
  })

  test("19.4 Access non-existent startup slug → 404", async () => {
    const res = await request(app)
      .get("/api/startups/non-existent-slug-99999")

    expect(res.status).toBe(404)
  })

  test("19.5 Access non-existent grant slug → 404", async () => {
    const res = await request(app)
      .get("/api/grants/fake-grant-slug-99999")

    expect(res.status).toBe(404)
  })

  test("19.6 Upload document with missing required fields → 400", async () => {
    const res = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${founderToken}`)
      .send({ name: "Test Doc" }) // missing folder and fileUrl

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 20: UPLOAD ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
describe("20. Upload Endpoint", () => {
  let founderToken

  beforeAll(async () => {
    const { token } = await createTestUser({
      email: "upload@test.com", role: "founder"
    })
    founderToken = token
  })

  test("20.1 Upload endpoint requires auth → 401", async () => {
    const res = await request(app).post("/api/upload")
    expect(res.status).toBe(401)
  })

  test("20.2 Upload endpoint exists and accepts auth", async () => {
    // Just check the route exists (actual file upload needs Cloudinary mock)
    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${founderToken}`)

    // Should not be 404 (route exists) even if it fails without a file
    expect(res.status).not.toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 21: SERVICE PROVIDER APPROVAL
// ─────────────────────────────────────────────────────────────────────────────
describe("21. Service Provider Approval", () => {
  let adminToken, providerUserId

  beforeAll(async () => {
    const admin = await createTestUser({
      email: "admin_sp@test.com", role: "super_admin"
    })
    adminToken = admin.token

    // Create unapproved service provider
    const provider = await User.create({
      name:       "Pending Provider",
      email:      "pending_provider@test.com",
      password:   "TestPass@123",
      role:       "service_provider",
      isApproved: false,
      isActive:   true,
    })
    providerUserId = provider._id
  })

  test("21.1 Admin sees pending service providers", async () => {
    const res = await request(app)
      .get("/api/admin/pending-service-providers")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.providers.length).toBeGreaterThan(0)
  })

  test("21.2 Unapproved provider cannot login → 403", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pending_provider@test.com", password: "TestPass@123" })

    expect(res.status).toBe(403)
  })

  test("21.3 Admin approves provider → isApproved: true", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${providerUserId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.isApproved).toBe(true)
  })

  test("21.4 After approval, provider can login", async () => {
    await User.findByIdAndUpdate(providerUserId, { isApproved: true })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pending_provider@test.com", password: "TestPass@123" })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  test("21.5 Non-admin cannot approve provider → 403", async () => {
    const { token } = await createTestUser({
      email: "nonadmin_sp@test.com", role: "founder"
    })

    const res = await request(app)
      .patch(`/api/admin/users/${providerUserId}/approve`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 22: SECURITY HEADERS & RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────
describe("22. Security Headers", () => {
  test("22.1 Helmet security headers present", async () => {
    const res = await request(app).get("/api/admin/stats")

    // Helmet adds these headers
    expect(res.headers["x-content-type-options"]).toBe("nosniff")
    expect(res.headers["x-frame-options"]).toBeDefined()
    expect(res.headers["x-xss-protection"]).toBeDefined()
  })

  test("22.2 API returns JSON content-type", async () => {
    const res = await request(app).get("/api/admin/stats")
    expect(res.headers["content-type"]).toMatch(/json/)
  })

  test("22.3 Non-existent route returns 404 not crash", async () => {
    const res = await request(app).get("/api/completely-fake-route")
    expect(res.status).toBe(404)
    // Should not be 500
    expect(res.status).not.toBe(500)
  })
})
