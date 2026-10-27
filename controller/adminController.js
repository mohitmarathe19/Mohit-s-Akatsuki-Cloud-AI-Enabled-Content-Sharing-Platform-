const Post = require("../model/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /admin/posts/pending
exports.getPendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "pending" })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

const decide = (newStatus) =>
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");
    if (post.status !== "pending") {
      throw new ApiError(400, `Only pending posts can be ${newStatus} (current: ${post.status})`);
    }
    post.status = newStatus;
    await post.save();
    res.json({ success: true, message: `Post ${newStatus}`, post });
  });

// PATCH /admin/posts/approve/:id
exports.approvePost = decide("approved");

// PATCH /admin/posts/reject/:id
exports.rejectPost = decide("rejected");
