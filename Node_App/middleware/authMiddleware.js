// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Malformed token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user; // Attach decoded user
    next();
  });
}

module.exports = authenticateToken;
