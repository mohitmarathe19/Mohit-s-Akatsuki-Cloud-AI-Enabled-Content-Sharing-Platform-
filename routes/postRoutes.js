const router = require("express").Router();
const {
  createPost,
  getApprovedPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controller/postController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createPost);
router.get("/", getApprovedPosts);
router.get("/my-posts", getMyPosts); // must be before "/:id"
router.get("/:id", getPostById);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);

module.exports = router;
