const express = require('express');
const router = express.Router();

// Log to verify route is registered
console.log('Webhook routes registered');

router.post('/payments', (req, res) => {
  try {
    // Log the incoming request
    console.log('\n🔔 Webhook Received at:', new Date().toISOString());
    console.log('\nHeaders:', req.headers);
    console.log('\nBody:', JSON.stringify(req.body, null, 2));

    // Send success response
    res.status(200).json({ 
      status: 'success',
      message: 'Webhook received successfully'
    });

  } catch (error) {
    // Log the error
    console.error('Webhook Error:', error);

    // Send error response
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
