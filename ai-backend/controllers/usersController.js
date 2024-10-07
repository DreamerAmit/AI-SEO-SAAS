const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

//------Registration-----
const register = asyncHandler(async (req, res) => {
  // This function should NOT have any authentication checks
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    console.log("Registration attempt for:", email);

    // Validate
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log("Validation failed: Missing fields");
      res.status(400);
      throw new Error("All fields are required");
    }
    
    // Check if the email is taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email);
      res.status(400);
      throw new Error("Email already exists");
    }
    
    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = new User({
      firstName,
      lastName,
      password: hashedPassword,
      email,
    });
    
    // Add the date the trial will end
    newUser.trialExpires = new Date(
      new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
    );

    // Save the user
    await newUser.save();
    
    console.log("User registered successfully:", email);

    // Send response
    res.status(201).json({
      status: "success",
      message: "Registration was successful",
      user: {
        firstName,
        lastName,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed: " + error.message
    });
  }
});
//------Login---------
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check for user email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  //check if password is valid
  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  //Generate token (jwt)
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  res.json({
    status: "success",
    token: token, // Add this line
    user: {
      _id: user?._id,
      username: user?.username,
      email: user?.email,
    },
    message: "Login success",
  });
});
//------Logout-----
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({ message: "Logged out successfully" });
});
//------Profile-----
const userProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?.id)
    .select("-password")
    .populate("payments")
    .populate("contentHistory");
  if (user) {
    res.status(200).json({
      status: "success",
      user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
//------Check user Auth Status-----
const checkAuth = asyncHandler(async (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
  if (decoded) {
    res.json({
      isAuthenticated: true,
    });
  } else {
    res.json({
      isAuthenticated: false,
    });
  }
});

module.exports = {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
};
