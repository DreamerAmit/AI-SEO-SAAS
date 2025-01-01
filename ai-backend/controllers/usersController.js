const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const PaymentService = require("../services/PaymentService");
const db = require('../connectDB');
const axios = require('axios');
const DodoPayments = require('dodopayments');

// Initialize payment service with parentheses
const paymentService = new PaymentService();

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
    console.log("User saved:", newUser);
    
    

    // Send response
    res.status(201).json({
      status: "success",
      message: "Registration was successful",
      user: {
        firstName,
        lastName,
        email,
        customer: {
          id: customer.id,
          customer_external_id: customer.customer_external_id
        }
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

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['firstName', 'lastName', 'email']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({
            firstName,
            lastName
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // // Validate password requirements
        // if (!validatePassword(newPassword)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
        //     });
        // }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await user.update({
            password: hashedPassword
        });

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

// Password validation helper
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Get user payment and subscription history
const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // items per page
    const offset = (page - 1) * limit;
    
    // First get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        (
          SELECT payment_id FROM payments
          WHERE user_id = $1 AND payment_type = 'credit_pack'
        )
        UNION ALL
        (
          SELECT subscription_id FROM subscriptions
          WHERE user_id = $1
        )
      ) as combined_records
    `;

    const totalCount = await db.query(countQuery, [userId]);
    const total = parseInt(totalCount.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    const query = `
      (
        SELECT 
          payment_id as id,
          amount,
          status,
          'credit_pack' as record_type,
          'Credit Pack Purchase' as title,
          credits_offered,
          created_at,
          failure_reason
        FROM payments
        WHERE user_id = $1
        AND payment_type = 'credit_pack'
      )
      UNION ALL
      (
        SELECT 
          s.subscription_id as id,
          p.price as amount,
          s.status,
          'subscription' as record_type,
          p.name as title,
          p.credits as credits_offered,
          s.created_at,
          s.failure_reason
        FROM subscriptions s
        LEFT JOIN plans p ON p.product_id = s.plan_id
        WHERE s.user_id = $1
      )
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [userId, limit, offset]);

    const transformedHistory = result.rows.map(record => ({
      title: record.status === 'failed' 
        ? `${record.title} (Failed)` 
        : record.title || 'Unknown Plan',
      date: record.created_at,
      transactionId: record.id,
      status: record.status,
      creditsAdded: record.status === 'failed' ? 0 : (record.credits_offered || 0)
    }));

    res.json({
      history: transformedHistory,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile with current subscription
const getUserProfileWithSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.name as current_plan,
        CASE 
          WHEN s.status = 'active' THEN 'Payment Successful'
          ELSE s.status
        END as payment_status,
        CASE 
          WHEN s.subscription_interval = 'month' THEN 'Monthly'
          WHEN s.subscription_interval = 'year' THEN 'Yearly'
          ELSE s.subscription_interval
        END as billing_cycle,
        s.current_period_end as next_renewal_date
      FROM subscriptions s
      JOIN plans p ON p.product_id = s.plan_id
      WHERE s.user_id = $1 
      AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    const result = await db.query(query, [userId]);
    console.log('Query result:', result);

    res.json({
      subscription: result.rows[0] || {
        current_plan: 'Trial',
        payment_status: 'Not Subscribed',
        billing_cycle: 'NA',
        next_renewal_date: null
      }
    });
    console.log("Subscription Details:", result.rows[0]);

  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
};

const cancelSubscriptionRenewal = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current subscription using only subscription_id
    const getCurrentSubQuery = `
      SELECT subscription_id
      FROM subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const currentSub = await db.query(getCurrentSubQuery, [userId]);
    
    if (!currentSub.rows[0]) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    console.log('Attempting to cancel subscription:', currentSub.rows[0].subscription_id);

    // Cancel subscription with Dodo Payments using direct API call
    try {
      const result = await axios.patch(
        `${process.env.DODO_PAYMENTS_URL}/subscriptions/${currentSub.rows[0].subscription_id}`,
        {
          status: 'cancelled'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DOOD_PAYMENTS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Dodo Payments cancellation result:', result.data);

      // Update subscription status in database
      const updateQuery = `
        UPDATE subscriptions 
        SET 
          status = 'expired',
          updated_at = NOW()
        WHERE subscription_id = $1 
        RETURNING *
      `;

      await db.query(updateQuery, [currentSub.rows[0].subscription_id]);

      // Return updated subscription details
      res.json({
        subscription: {
          current_plan: 'Trial',
          payment_status: 'Not Subscribed',
          billing_cycle: 'NA',
          next_renewal_date: null
        },
        message: 'Subscription cancelled successfully'
      });

    } catch (error) {
      console.error('Detailed Dodo Payments error:', error.response?.data || error.message);
      return res.status(500).json({ 
        message: 'Failed to cancel subscription with payment provider',
        details: error.response?.data || error.message
      });
    }

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

module.exports = {
  register,
  login,
  logout,
  userProfile,
  checkAuth,
  getProfile,
  updateProfile,
  changePassword,
  getUserPaymentHistory,
  getUserProfileWithSubscription,
  cancelSubscriptionRenewal
};