const path = require('path'); //needed to re-setting password re-reouting
const express = require('express');
const router = express.Router(); // Initialize the router
const mongoose = require('mongoose');

require('dotenv').config(); // This loads environment variables from .env
const axios = require('axios'); // Or use fetch() if you prefer
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require("jsonwebtoken"); // session handling


//hashing of the passwords
const bcrypt = require('bcryptjs');


//Database Schemas
const User = require('./models/User');  // user schema
const GlobalFeed = require('./models/globalFeed');  // feed schema

//Routes init.
const singup_routes = require('./routes/signup_routes');     // sign-in-related routes intilization
const login_routes = require('./routes/login_routes');       // log-in related routes intilization
const dashboard_routes = require('./routes/dashboard_routes');   // dashboard related routes intilization
const globalFeedRoutes = require('./routes/globalFeedRoutes');





//enable mongoDB connection
const app = express();
const client = new MongoClient(process.env.MONGO_URI);


// Enable CORS for all origins (you can modify it to restrict specific domains)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB URI (Use environment variable for sensitive information)
const mongoURI = process.env.MONGO_URI; // Access your MongoDB URI securely

// Connect to MongoDB using the URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));




//secret key for jwt
const SECRET_KEY = process.env.SECRET_KEY;


module.exports = router;


// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

// test route to view profile dashboard
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'profile.html'));
});

// test route to view signup
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'signup.html'));
});
// sign in
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'signin.html'));
});
// feed
app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'feed.html'));
});



//serve images
app.use('/images', express.static('public/images'));


//Main routes for MongoDB:
//routes for specific paths/aspects of the site (api routes are included within some of them)
app.use('/signup', singup_routes); //routing for sign up page

app.use("/login", login_routes);  //routing for login 

app.use("/dashboard", dashboard_routes);  //routing for login page


app.use("/globalFeed", globalFeedRoutes); //route for global feed










// Start the server
const PORT = process.env.PORT || 5001;




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

