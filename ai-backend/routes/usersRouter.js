const express = require("express");
const {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
} = require("../controllers/usersController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { verifyPayment } = require("../controllers/handleStripePayment");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendConfirmationEmail } = require('../utils/emailSender');

const usersRouter = express.Router();

// Add or update the registration route
usersRouter.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      confirmationToken,
      confirmationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    });

    await user.save();

    console.log('Attempting to send confirmation email');
    await sendConfirmationEmail(email, confirmationToken);
    console.log('Confirmation email sent successfully');

    res.status(201).json({status: "success", message: 'User registered successfully. Please check your email to confirm your account.' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('address not allowed')) {
      return res.status(500).json({ 
        message: 'Server error during registration', 
        error: 'Email configuration error. Please check Mailgun settings.'
      });
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Add the email confirmation route
usersRouter.get("/confirm-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Received token:', token);

    // Log all users with this token or confirmed email
    const users = await User.find({
      $or: [
        { confirmationToken: token },
        { isEmailConfirmed: true }
      ]
    });

    console.log('Matching users:', users);

    if (users.length === 0) {
      console.log('No user found with this token');
      return res.status(400).json({ message: 'Invalid confirmation token' });
    }

    const user = users[0];
    console.log('User state:', {
      id: user._id,
      email: user.email,
      isEmailConfirmed: user.isEmailConfirmed,
      confirmationToken: user.confirmationToken,
      confirmationTokenExpires: user.confirmationTokenExpires
    });

    if (user.isEmailConfirmed) {
      console.log('Account Confirmed');
      return res.json({ status: "success", message: 'Account confirmed successfully, now click on Login button to continue' });
    }

    if (user.confirmationTokenExpires && user.confirmationTokenExpires < Date.now()) {
      console.log('Token expired');
      return res.status(400).json({ message: 'Confirmation token has expired' });
    }

    user.isEmailConfirmed = true;
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;

    await user.save();
    console.log('User updated successfully');

  //  res.json({ message: 'Email confirmed successfully' });
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ message: 'Server error during email confirmation' });
  }
});

usersRouter.post("/login", login);
usersRouter.post("/logout", logout);
usersRouter.get("/profile", isAuthenticated, userProfile);
usersRouter.get("/auth/check", isAuthenticated, checkAuth);


module.exports = usersRouter;
