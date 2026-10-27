const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, trim: true, default: "" },
  content: { type: String, required: [true, "Content is required"] },
  image: { type: String, default: "" },
  category: { type: String, trim: true, default: "general" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  // set when a post was produced by the AI improve endpoint
  improvedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
