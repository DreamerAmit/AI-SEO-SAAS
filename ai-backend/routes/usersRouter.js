const express = require("express");
const {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
  getUserProfileWithSubscription,
  getUserPaymentHistory,
  cancelSubscriptionRenewal
} = require("../controllers/usersController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { verifyPayment } = require("../controllers/handleStripePayment");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendConfirmationEmail } = require('../utils/emailSender');
const db = require('../connectDB');
const jwt = require('jsonwebtoken');
const scrapeController = require('../controllers/scrapeController');
const userController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/isAuthenticated');
const PaymentService = require('../services/PaymentService');
const paymentService = new PaymentService();

const usersRouter = express.Router();

// Add or update the registration route
usersRouter.post("/register", async (req, res, next) => {
  console.log('Received registration request:', req.body);
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');

    // Set expiration time for the token (e.g., 24 hours from now)
    const confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const { rows: [newUser] } = await db.query(
      'INSERT INTO "Users" ("firstName", "lastName", "email", "password", "confirmationToken", "confirmationTokenExpires") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, "firstName", "lastName", "email", "confirmationToken", "confirmationTokenExpires"',
      [firstName, lastName, email, hashedPassword, confirmationToken, confirmationTokenExpires]
    );
    console.log('UserId:', newUser.id);
    console.log('Attempting to send confirmation email');
    await sendConfirmationEmail(email, confirmationToken);
    console.log('Confirmation email sent successfully');
        // Create customer in payment service
    const customer = await paymentService.createCustomer({
      user_id: newUser.id,
      customer_external_id: newUser.id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    });

    console.log('Customer creation response:', customer);

    await db.query('COMMIT');
    
    console.log("User registered successfully:", email);
    res.status(201).json({
      status: "success",
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Add the email confirmation route
usersRouter.get("/confirm-email/:token", async (req, res) => {
  try {
    
    const { token } = req.params.token;
    console.log('Received token:', token);

    // First, find the user with this token
    const result = await db.query('SELECT * FROM "Users" WHERE "confirmationToken" = $1', [token]);
    const user = result.rows[0];
    console.log('User found:', user);

    if (!user) {
      console.log('No user found with this token');
      return res.json({ status: 'success', message: 'Either the email is already confirmed or the confirmation token is invalid' });
    }

    if (user.isEmailConfirmed) {
      return res.json({ status: 'success', message: 'Email already confirmed' });
    }

    res.json({ status: 'success', message: 'Email confirmed successfully' });
    // If we've reached here, the token is valid and the email isn't confirmed yet
    // Now we update the user
    
    await db.query(
      'UPDATE "Users" SET "isEmailConfirmed" = true, "confirmationToken" = NULL, "confirmationTokenExpires" = NULL WHERE id = $1',
      [user.id]
    );

    console.log('User updated successfully');
    
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ message: 'Server error during email confirmation' });
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM "Users" WHERE email = $1 AND "isEmailConfirmed" = true', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials or account is not confirmed" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log('Login response:', { status: "success", token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
    res.json({ status: "success", token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

usersRouter.post("/logout", logout);
usersRouter.get("/profile", isAuthenticated, async (req, res) => {
  try {
    // Fetch user data from database
    const result = await db.query('SELECT (SELECT COUNT(*) FROM "images" WHERE "user_id" = "Users"."id") As "imagecount","id", email, "firstName", "lastName", "subscriptionPlan", "monthlyRequestCount", "apiRequestCount", "image_credits" FROM "Users" WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch payment history
    const paymentsResult = await db.query('SELECT * FROM "Payments" WHERE "id" = $1 ORDER BY "createdAt" DESC', [req.user.id]);
    user.payments = paymentsResult.rows;

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});
usersRouter.get("/auth/check", isAuthenticated, checkAuth);

// Profile routes
usersRouter.get('/profile', isAuthenticated, userController.getProfile);
usersRouter.put('/update-profile', isAuthenticated, userController.updateProfile);

// Password routes
usersRouter.put('/change-password', isAuthenticated, userController.changePassword);

usersRouter.post('/scrape-and-generate', scrapeController.scrapeAndGenerate);

// Add these new routes after existing routes
usersRouter.get("/subscription-details", isAuthenticated, getUserProfileWithSubscription);
usersRouter.get("/billing-history", isAuthenticated, getUserPaymentHistory);
usersRouter.post("/cancel-subscription", isAuthenticated, cancelSubscriptionRenewal);

module.exports = usersRouter;
