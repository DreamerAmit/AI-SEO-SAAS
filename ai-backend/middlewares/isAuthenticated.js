const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
      //! Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //add the user to the req obj
      req.user = await User.findById(decoded?.id).select("-password");
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
