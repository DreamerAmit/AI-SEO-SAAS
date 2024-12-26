const db = require('../connectDB');

class WebhookService {
  constructor() {
    this.processWebhook = this.processWebhook.bind(this);
    this.storeWebhookData = this.storeWebhookData.bind(this);
    this.findOrInitializePaymentIntent = this.findOrInitializePaymentIntent.bind(this);
  }

  async processWebhook(webhookData) {
    try {
      console.log('Processing webhook:', webhookData.type);

      // 1. Store webhook data
      const webhookRecord = await this.storeWebhookData(webhookData);
      console.log('Webhook stored:', webhookRecord);
      
      // 2. Initialize payment intent
      const paymentIntent = await this.findOrInitializePaymentIntent(webhookData);
      console.log('Payment Intent initialized:', paymentIntent);

      // 3. Process based on webhook type
      switch (webhookData.type) {
        case 'payment.mandate.created':
          await this.processMandateWebhook(webhookData, paymentIntent);
          break;

        case 'subscription.active':
          await this.processSubscriptionWebhook(webhookData, paymentIntent);
          break;

        case 'payment.succeeded':
          await this.processPaymentWebhook(webhookData, paymentIntent);
          break;

        default:
          console.log('Unhandled webhook type:', webhookData.type);
      }

      return { success: true };

    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  async storeWebhookData(webhookData) {
    try {
      const query = `
        INSERT INTO payment_webhooks (
          event_type,
          provider,
          raw_data,
          processed,
          received_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const values = [
        webhookData.type,
        'your_payment_provider',
        webhookData,
        false
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error storing webhook:', error);
      throw error;
    }
  }

  async findOrInitializePaymentIntent(webhookData) {
    try {
      const query = `
        INSERT INTO payment_intents (
          gateway_payment_intent_id,
          customer_id,
          amount,
          currency,
          status,
          metadata,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (gateway_payment_intent_id) 
        DO UPDATE SET 
          updated_at = CURRENT_TIMESTAMP,
          status = EXCLUDED.status
        RETURNING *;
      `;

      const values = [
        webhookData.data.payment_intent_id,
        webhookData.data.customer.customer_id,
        webhookData.data.recurring_pre_tax_amount,
        webhookData.data.currency,
        'initialized',
        webhookData.data
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error initializing payment intent:', error);
      throw error;
    }
  }

  async processMandateWebhook(webhookData, paymentIntent) {
    console.log('Processing mandate webhook');
    // Implementation for mandate webhook
    const query = `
      UPDATE payment_intents 
      SET status = 'mandate_received', 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *;
    `;
    
    return await db.query(query, [paymentIntent.id]);
  }

  async processSubscriptionWebhook(webhookData, paymentIntent) {
    console.log('Processing subscription webhook');
    // Implementation for subscription webhook
    const query = `
      UPDATE payment_intents 
      SET status = 'subscription_active', 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *;
    `;
    
    return await db.query(query, [paymentIntent.id]);
  }

  async processPaymentWebhook(webhookData, paymentIntent) {
    console.log('Processing payment webhook');
    // Implementation for payment webhook
    const query = `
      UPDATE payment_intents 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `;
    
    return await db.query(query, [
      webhookData.type === 'payment.succeeded' ? 'succeeded' : 'failed',
      paymentIntent.id
    ]);
  }
}

module.exports = WebhookService;
