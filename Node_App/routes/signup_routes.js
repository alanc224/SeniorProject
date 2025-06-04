const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, username, password, confirm_password, favourite_cuisine } = req.body;

    if (!first_name || !last_name || !username || !password || !favourite_cuisine)
      return res.status(400).json({ error: "All fields are required." });

    if (password !== confirm_password)
      return res.status(400).json({ error: "Passwords do not match." });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists." });

    // 🔐 Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      favourite_cuisine,
    });

    await newUser.save();
    res.json({ message: "Signup successful!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
