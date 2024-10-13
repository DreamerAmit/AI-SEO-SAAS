const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { query } = require("../connectDB"); // Import the query function from connectDB
const db = require('../connectDB');

//----IsAuthenticated middleware
const isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const result = await db.query('SELECT id FROM "Users" WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error:", error.message);
    }
    res.status(401).json({ message: "Token is not valid" });
  }
});

module.exports = isAuthenticated;
