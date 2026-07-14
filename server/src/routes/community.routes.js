const { Router } = require("express");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePostUpvote,
  moderatePost,
  getComments,
  createComment,
  toggleCommentUpvote,
  deleteComment,
  getTrendingTags,
  getCommunityStats,
} = require("../controllers/community.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = Router();

// ── PUBLIC ──────────────────────────────────────────────────────────
router.get("/posts",                    getAllPosts);
router.get("/posts/:id",                getPostById);
router.get("/posts/:id/comments",       getComments);
router.get("/tags/trending",            getTrendingTags);
router.get("/stats",                    getCommunityStats);

// ── AUTHENTICATED (any logged-in user) ──────────────────────────────
router.post(   "/posts",                     protect, createPost);
router.put(    "/posts/:id",                 protect, updatePost);
router.delete( "/posts/:id",                 protect, deletePost);
router.post(   "/posts/:id/upvote",          protect, togglePostUpvote);
router.post(   "/posts/:id/comments",        protect, createComment);
router.post(   "/comments/:id/upvote",       protect, toggleCommentUpvote);
router.delete( "/comments/:id",              protect, deleteComment);

// ── ADMIN ONLY ───────────────────────────────────────────────────────
router.patch(
  "/posts/:id/moderate",
  protect,
  authorizeRoles("super_admin"),
  moderatePost
);

module.exports = router;
