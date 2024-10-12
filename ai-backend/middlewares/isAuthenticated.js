const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { query } = require("../connectDB"); // Import the query function from connectDB

//----IsAuthenticated middleware
const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // Check for token in Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from PostgreSQL using the query function from connectDB
      const { rows } = await query(
        'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = rows[0];
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = isAuthenticated;
