const router = require("express").Router();
const {
  getPendingPosts,
  approvePost,
  rejectPost,
} = require("../controller/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

router.get("/posts/pending", getPendingPosts);
router.patch("/posts/approve/:id", approvePost);
router.patch("/posts/reject/:id", rejectPost);

module.exports = router;
