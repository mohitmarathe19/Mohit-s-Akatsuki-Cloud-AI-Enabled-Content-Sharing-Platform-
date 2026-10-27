const Post = require("../model/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const USER_SETTABLE_STATUS = ["draft", "pending"];

// POST /posts  -> status "draft" (save draft) or "pending" (submit for approval)
exports.createPost = asyncHandler(async (req, res) => {
  const { title, description, content, image, category, status } = req.body;
  if (!title || !content) throw new ApiError(400, "title and content are required");

  const finalStatus = status || "draft";
  if (!USER_SETTABLE_STATUS.includes(finalStatus)) {
    throw new ApiError(400, 'status must be "draft" or "pending"');
  }

  const post = await Post.create({
    title,
    description,
    content,
    image,
    category,
    status: finalStatus,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, post });
});

// GET /posts  -> all approved posts (optional ?category=&search=)
exports.getApprovedPosts = asyncHandler(async (req, res) => {
  const filter = { status: "approved" };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }
  const posts = await Post.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

// GET /posts/my-posts  -> own posts and drafts (all statuses)
exports.getMyPosts = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

// GET /posts/:id  -> approved post by ID
exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: "approved" }).populate(
    "createdBy",
    "name email"
  );
  if (!post) throw new ApiError(404, "Approved post not found");
  res.json({ success: true, post });
});

// PATCH /posts/:id  -> update own post
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own posts");
  }

  const { title, description, content, image, category, status } = req.body;
  if (title !== undefined) post.title = title;
  if (description !== undefined) post.description = description;
  if (content !== undefined) post.content = content;
  if (image !== undefined) post.image = image;
  if (category !== undefined) post.category = category;

  if (status !== undefined) {
    if (!USER_SETTABLE_STATUS.includes(status)) {
      throw new ApiError(400, 'status must be "draft" or "pending"');
    }
    post.status = status;
  } else if (["approved", "rejected"].includes(post.status)) {
    // edited after a decision -> goes back to draft so it can be re-submitted
    post.status = "draft";
  }

  await post.save();
  res.json({ success: true, post });
});

// DELETE /posts/:id  -> delete own post
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own posts");
  }
  await post.deleteOne();
  res.json({ success: true, message: "Post deleted" });
});
