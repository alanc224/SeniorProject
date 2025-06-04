// models/globalFeed.js
const mongoose = require("mongoose");

const globalFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // references User model
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: [String], // you can store userIds or usernames
    default: [],
  },
  comments: {
    type: [String], // you can upgrade to full comment schema later
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("GlobalFeed", globalFeedSchema);
