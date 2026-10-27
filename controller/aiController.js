const Post = require("../model/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { improvePostContent } = require("../services/aiService");

// POST /ai/improve/:postId
// Improves content with Gemini and saves it as a NEW draft (new ID, same user).
// The original post is left untouched.
exports.improvePost = asyncHandler(async (req, res) => {
  const original = await Post.findById(req.params.postId);
  if (!original) throw new ApiError(404, "Post not found");
  if (original.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only improve your own posts");
  }

  const improved = await improvePostContent(original, req.body?.instructions);

  const newPost = await Post.create({
    title: improved.title || original.title,
    description: improved.description ?? original.description,
    content: improved.content,
    image: original.image,
    category: original.category,
    createdBy: req.user._id,
    status: "draft",
    improvedFrom: original._id,
  });

  res.status(201).json({
    success: true,
    message: "AI-improved version saved as a new draft",
    originalPostId: original._id,
    post: newPost,
  });
});
