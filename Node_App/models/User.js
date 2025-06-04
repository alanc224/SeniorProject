const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  favourite_cuisine: { type: String, required: true },
  wishlist: [{
    title: String,
    ingredients: [String]
  }]
  
});


module.exports = mongoose.model('User', userSchema);
