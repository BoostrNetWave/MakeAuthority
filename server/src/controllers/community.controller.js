const Post    = require("../models/Post");
const Comment = require("../models/Comment");

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Build threaded comment tree from flat array
const buildCommentTree = (comments) => {
  const map = {};
  const roots = [];

  comments.forEach(c => {
    map[c._id.toString()] = { ...c.toObject(), replies: [] };
  });

  comments.forEach(c => {
    if (c.parentComment) {
      const parent = map[c.parentComment.toString()];
      if (parent) {
        parent.replies.push(map[c._id.toString()]);
      }
    } else {
      roots.push(map[c._id.toString()]);
    }
  });

  return roots;
};

// ─── GET ALL POSTS ────────────────────────────────────────────────────────────
// GET /api/community/posts?category=qa&sort=top&search=fundraising&page=1
const getAllPosts = async (req, res) => {
  try {
    const {
      category,
      tag,
      search,
      sort = "newest",
      page  = 1,
      limit = 15,
    } = req.query;

    const filter = { isDeleted: false };

    if (category) filter.category = category;
    if (tag)      filter.tags     = { $in: [tag.toLowerCase()] };

    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    let sortObj = { isPinned: -1, createdAt: -1 }; // default newest, pinned first
    if (sort === "top")       sortObj = { isPinned: -1, upvoteCount: -1 };
    if (sort === "discussed") sortObj = { isPinned: -1, commentCount: -1 };
    if (sort === "oldest")    sortObj = { isPinned: -1, createdAt:    1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("author", "name avatar role")
      .select("-body") // don't send full body in list view
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      posts,
    });
  } catch (error) {
    console.error("getAllPosts error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE POST ──────────────────────────────────────────────────────────
// GET /api/community/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate("author", "name avatar role createdAt");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Increment views (fire and forget — don't await)
    Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── CREATE POST ──────────────────────────────────────────────────────────────
// POST /api/community/posts
const createPost = async (req, res) => {
  try {
    const { title, body, category, tags, coverImage } = req.body;

    if (!title || !body || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, body, and category are required.",
      });
    }

    // Normalize tags — lowercase, trim, deduplicate, max 5
    const normalizedTags = tags
      ? [...new Set(tags.map(t => t.toLowerCase().trim()))].slice(0, 5)
      : [];

    const post = await Post.create({
      title,
      body,
      category,
      tags:       normalizedTags,
      coverImage: coverImage || null,
      author:     req.user._id,
    });

    await post.populate("author", "name avatar role");

    return res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("createPost error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE POST ──────────────────────────────────────────────────────────────
// PUT /api/community/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Only author or admin can edit
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const { title, body, tags, coverImage } = req.body;

    if (title)       post.title      = title;
    if (body)        post.body       = body;
    if (coverImage)  post.coverImage = coverImage;
    if (tags) {
      post.tags = [...new Set(tags.map(t => t.toLowerCase().trim()))].slice(0, 5);
    }

    await post.save();
    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE POST (soft delete) ────────────────────────────────────────────────
// DELETE /api/community/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    return res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── TOGGLE UPVOTE (post) ─────────────────────────────────────────────────────
// POST /api/community/posts/:id/upvote
const togglePostUpvote = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const userId     = req.user._id.toString();
    const alreadyUp  = post.upvotes.map(id => id.toString()).includes(userId);

    if (alreadyUp) {
      post.upvotes     = post.upvotes.filter(id => id.toString() !== userId);
      post.upvoteCount = Math.max(0, post.upvoteCount - 1);
    } else {
      post.upvotes.push(req.user._id);
      post.upvoteCount += 1;
    }

    await post.save({ validateBeforeSave: false });

    return res.status(200).json({
      success:  true,
      upvoted:  !alreadyUp,
      upvotes:  post.upvoteCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADMIN: PIN / LOCK POST ───────────────────────────────────────────────────
// PATCH /api/community/posts/:id/moderate
const moderatePost = async (req, res) => {
  try {
    const { isPinned, isLocked } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...(isPinned  !== undefined && { isPinned }),
        ...(isLocked  !== undefined && { isLocked }),
      },
      { returnDocument: 'after' }
    );

    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET COMMENTS ─────────────────────────────────────────────────────────────
// GET /api/community/posts/:id/comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post:      req.params.id,
      isDeleted: false,
    })
      .populate("author", "name avatar role")
      .sort({ createdAt: 1 });

    const tree = buildCommentTree(comments);

    return res.status(200).json({
      success:  true,
      total:    comments.length,
      comments: tree,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── CREATE COMMENT ───────────────────────────────────────────────────────────
// POST /api/community/posts/:id/comments
const createComment = async (req, res) => {
  try {
    const { body, parentComment } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty." });
    }

    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    if (post.isLocked) {
      return res.status(403).json({ success: false, message: "This post is locked." });
    }

    // Validate parent comment exists if replying
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent comment not found." });
      }
    }

    const comment = await Comment.create({
      post:          req.params.id,
      author:        req.user._id,
      body:          body.trim(),
      parentComment: parentComment || null,
    });

    // Increment comment count on post
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    await comment.populate("author", "name avatar role");

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("createComment error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── TOGGLE UPVOTE (comment) ──────────────────────────────────────────────────
// POST /api/community/comments/:id/upvote
const toggleCommentUpvote = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const userId    = req.user._id.toString();
    const alreadyUp = comment.upvotes.map(id => id.toString()).includes(userId);

    if (alreadyUp) {
      comment.upvotes     = comment.upvotes.filter(id => id.toString() !== userId);
      comment.upvoteCount = Math.max(0, comment.upvoteCount - 1);
    } else {
      comment.upvotes.push(req.user._id);
      comment.upvoteCount += 1;
    }

    await comment.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      upvoted: !alreadyUp,
      upvotes: comment.upvoteCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE COMMENT (soft delete) ────────────────────────────────────────────
// DELETE /api/community/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // Soft delete — keeps thread structure intact
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.body      = "[deleted]"; // Reddit-style
    await comment.save({ validateBeforeSave: false });

    // Decrement post comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    return res.status(200).json({ success: true, message: "Comment deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET TRENDING TAGS ────────────────────────────────────────────────────────
// GET /api/community/tags/trending
const getTrendingTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    return res.status(200).json({ success: true, tags });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET CATEGORY STATS ───────────────────────────────────────────────────────
// GET /api/community/stats
const getCommunityStats = async (req, res) => {
  try {
    const [postCount, commentCount, categoryBreakdown] = await Promise.all([
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Post.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      stats: { postCount, commentCount, categoryBreakdown },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
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
};
