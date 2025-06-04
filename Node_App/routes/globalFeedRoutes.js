// routes/globalFeedRoutes.js
const express = require("express");
const router = express.Router();
const GlobalFeed = require("../models/globalFeed");
const User = require('../models/User');

const authenticateToken = require("../middleware/authMiddleware");




// POST a new feed post
router.post("/api/post", authenticateToken, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required." });
  }

  try {
    // Get full user info from DB using username in token
    const user = await User.findOne({ username: req.user.username });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newPost = new GlobalFeed({
      userId: user._id,
      userName: user.username,
      content
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error("Post creation failed:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET all posts (newest first)
router.get("/api/posts", async (req, res) => {
  try {
    const posts = await GlobalFeed.find().sort({ timestamp: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch posts." });
  }
});


//like a post
router.post("/api/like/:id", authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const username = req.user.username;

  try {
    const post = await GlobalFeed.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.likes.includes(username)) {
      post.likes = post.likes.filter(u => u !== username);
    } else {
      post.likes.push(username);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Could not like post" });
  }
});


//delete a post
router.delete("/api/post/:id", authenticateToken, async (req, res) => {
  try {
    const post = await GlobalFeed.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userName !== req.user.username) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await GlobalFeed.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Could not delete post" });
  }
});



module.exports = router;
