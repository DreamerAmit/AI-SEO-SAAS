const express = require('express');
const router = express.Router();
const WebhookService = require('../services/WebhookService');

router.post('/payments', async (req, res) => {
  try {
    // Create new instance for each request
    const webhookService = new WebhookService();
    
    console.log('Webhook received:', {
      type: req.body.type,
      timestamp: new Date().toISOString()
    });

    const result = await webhookService.processWebhook(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Webhook Error:', {
      message: error.message,
      stack: error.stack
    });

    res.status(200).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
