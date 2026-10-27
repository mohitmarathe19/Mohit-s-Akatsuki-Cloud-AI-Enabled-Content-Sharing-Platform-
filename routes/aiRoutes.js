const router = require("express").Router();
const { improvePost } = require("../controller/aiController");
const { protect } = require("../middleware/auth");

router.post("/improve/:postId", protect, improvePost);

module.exports = router;
