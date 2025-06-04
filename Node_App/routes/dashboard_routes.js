const express = require('express');
const router = express.Router();
const User = require('../models/User');

// fetch user information for dashboard
const authenticateToken = require("../middleware/authMiddleware");





router.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      favourite_cuisine: user.favourite_cuisine,
      wishlist: user.wishlist || [],
      favorites: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;


// Example route: POST /dashboard/api/wishlist
router.post("/api/wishlist", authenticateToken, async (req, res) => {
    try {
      const title = req.body["Food Name"] || req.body.title;
      const ingredients = req.body.ingredients;
  
      if (!title || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: "Missing title or ingredients" });
      }
  
      const user = await User.findOne({ username: req.user.username });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      if (user.wishlist.some(item => item.title === title)) {
        return res.status(409).json({ error: "Already in wishlist" });
      }
  
      user.wishlist.push({ title, ingredients });
      await user.save();
      res.json({ message: "Added to wishlist!" });
  
    } catch (err) {
      console.error("Wishlist save error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
