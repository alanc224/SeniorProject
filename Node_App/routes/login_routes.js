const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY 

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Both fields are required." });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ error: "Invalid username or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid username or password." });

    // 🔐 Create token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "2h" });

    // ✅ Return it to frontend
    res.json({
      message: "Login successful!",
      token,
      user: {
        username: user.username,
        favourite_cuisine: user.favourite_cuisine
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});
module.exports = router; // ✅ THIS is important
