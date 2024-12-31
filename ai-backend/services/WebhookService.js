const db = require('../connectDB');

class WebhookService {
  constructor() {
    this.processWebhook = this.processWebhook.bind(this);
  }

  async processWebhook(webhookData, headers) {
    try {
      // Log webhook headers and body
      console.log('\n🔔 Webhook Received at:', new Date().toISOString());
      console.log('\nHeaders:', JSON.stringify(headers, null, 2));
      console.log('\nBody:', JSON.stringify(webhookData, null, 2));

      // Store webhook in database
      console.log('\n📝 Storing webhook data...');
      const storeWebhookQuery = `
        INSERT INTO payment_webhooks (
          payment_id,
          event_type,
          provider,
          raw_data,
          processed,
          received_at,
          processed_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NULL)
        RETURNING id
      `;

      const webhookValues = [
        webhookData.data?.payment_id || null,
        webhookData.type,
        'card',
        webhookData,
        false
      ];

      console.log('Webhook values:', {
        payment_id: webhookValues[0],
        event_type: webhookValues[1],
        provider: webhookValues[2],
        processed: webhookValues[4]
      });

      const webhookResult = await db.query(storeWebhookQuery, webhookValues);
      console.log('✅ Webhook stored successfully with ID:', webhookResult.rows[0].id);
      const webhookId = webhookResult.rows[0].id;

      try {
        // Process the webhook based on type
        switch (webhookData.type) {
          case 'payment.succeeded':
            if (webhookData.data.total_amount === 0) {
              console.log('\n⚡ Processing mandate webhook...');
              await this.processMandateWebhook(webhookData);
            } else {
              console.log('\n⚡ Processing payment webhook...');
              await this.processPaymentWebhook(webhookData);
            }
            break;

          case 'payment.failed':
            console.log('\n⚡ Processing failed payment webhook...');
            await this.processFailedPaymentWebhook(webhookData);
            break;

          case 'subscription.active':
            console.log('\n⚡ Processing subscription webhook...');
            await this.processSubscriptionWebhook(webhookData);
            break;

          case 'subscription.failed':
            console.log('\n⚡ Processing failed subscription webhook...');
            await this.processFailedSubscriptionWebhook(webhookData);
            break;

          default:
            console.log('\n⚠️ Unhandled webhook type:', webhookData.type);
        }

        // Update webhook as processed
        const updateWebhookQuery = `
          UPDATE payment_webhooks
          SET 
            processed = true,
            processed_at = NOW()
          WHERE id = $1
        `;
        await db.query(updateWebhookQuery, [webhookId]);

        console.log('\n✅ Webhook processed successfully\n');
        return { success: true };

      } catch (processingError) {
        // If processing fails, we still want to record the error in the webhook record
        const updateWebhookErrorQuery = `
          UPDATE payment_webhooks
          SET 
            processed = false
          WHERE id = $1
        `;
        await db.query(updateWebhookErrorQuery, [webhookId, processingError.message]);
        throw processingError;
      }

    } catch (error) {
      console.error('\n❌ Webhook processing error:', error);
      throw error;
    }
  }

  async processMandateWebhook(webhookData) {
    const { customer, subscription_id, created_at } = webhookData.data;

    try {
      // First update customer_id in customers table
      const updateCustomerQuery = `
        UPDATE customers 
        SET 
          customer_id = $1,
          updated_at = NOW()
        WHERE email = $2
        RETURNING customer_id
      `;

      const customerResult = await db.query(updateCustomerQuery, [
        customer.customer_id,
        customer.email
      ]);

      if (customerResult.rows.length === 0) {
        throw new Error(`Customer not found for email: ${customer.email}`);
      }

      // Now check and create subscription
      const checkQuery = `
        SELECT subscription_id FROM subscriptions 
        WHERE subscription_id = $1
      `;
      const existingSubscription = await db.query(checkQuery, [subscription_id]);

      if (existingSubscription.rows.length > 0) {
        console.log('Subscription already exists, skipping mandate processing');
        return;
      }

      // Insert subscription using the customer_id we just updated
      const insertQuery = `
        INSERT INTO subscriptions (
          customer_id,
          subscription_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        customerResult.rows[0].customer_id,  // Using the customer_id we just confirmed
        subscription_id,
        'Payment Processing'
      ];

      const result = await db.query(insertQuery, values);
      console.log('Created new subscription with Processing status:', result.rows[0]);

    } catch (error) {
      console.error('Mandate processing error:', error);
      throw error;
    }
  }

  async processSubscriptionWebhook(webhookData) {
    const {
      subscription_id,
      customer,
      product_id,
      status,
      payment_frequency_interval
    } = webhookData.data;

    try {
      // First update customer_id in customers table
      const updateCustomerQuery = `
        UPDATE customers 
        SET 
          customer_id = $1,
          updated_at = NOW()
        WHERE email = $2
        RETURNING id
      `;

      const customerUpdateResult = await db.query(updateCustomerQuery, [
        customer.customer_id,
        customer.email
      ]);

      if (customerUpdateResult.rows.length === 0) {
        throw new Error(`Customer not found for email: ${customer.email}`);
      }

      // Keep existing getUserQuery logic
      const getUserQuery = `
        SELECT user_id 
        FROM customers 
        WHERE customer_id = $1
      `;
      
      const userResult = await db.query(getUserQuery, [customer.customer_id]);
      
      if (userResult.rows.length === 0) {
        throw new Error(`No user found for customer_id: ${customer.customer_id}`);
      }

      const user_id = userResult.rows[0].user_id;

      // Expire existing active subscriptions for this user
      const expireExistingQuery = `
        UPDATE subscriptions 
        SET 
          status = 'expired',
          updated_at = NOW()
        WHERE user_id = $1
          AND status = 'active'
          AND subscription_id != $2
        RETURNING *
      `;

      const expiredSubs = await db.query(expireExistingQuery, [
        user_id,
        subscription_id
      ]);

      if (expiredSubs.rows.length > 0) {
        console.log('Expired previous subscriptions:', expiredSubs.rows);
      }

      // Get plan details and credits
      const planQuery = `
        SELECT id, credits
        FROM plans 
        WHERE product_id = $1
      `;
      const planResult = await db.query(planQuery, [product_id]);

      if (planResult.rows.length === 0) {
        throw new Error(`Invalid plan: Product ID ${product_id} not found`);
      }

      const planCredits = planResult.rows[0].credits;

      // Check if subscription exists
      const checkQuery = `
        SELECT id FROM subscriptions 
        WHERE subscription_id = $1
      `;
      const existingSubscription = await db.query(checkQuery, [subscription_id]);

      if (existingSubscription.rows.length > 0) {
        // Calculate period end based on subscription interval
        const current_period_start = new Date();
        let current_period_end = new Date();
        
        switch(payment_frequency_interval) {
          case 'Month':
            current_period_end.setMonth(current_period_end.getMonth() + 1);
            break;
          case 'Year':
            current_period_end.setFullYear(current_period_end.getFullYear() + 1);
            break;
          default:
            throw new Error(`Unsupported subscription interval: ${payment_frequency_interval}`);
        }

        const updateQuery = `
          UPDATE subscriptions 
          SET 
            user_id = $1,
            customer_id = $2,
            plan_id = $3,
            status = $4,
            current_period_start = NOW(),
            current_period_end = $5,
            updated_at = NOW(),
            subscription_interval = $6
          WHERE subscription_id = $7
          RETURNING *
        `;

        const updateValues = [
          user_id,
          customer.customer_id,
          product_id,
          status,
          current_period_end,
          payment_frequency_interval,
          subscription_id
        ];

        const result = await db.query(updateQuery, updateValues);
        console.log('Updated subscription to Payment Successful:', result.rows[0]);

        // If subscription is active, update user credits
        if (status === 'active') {
          await this.addUserCredits(customer.customer_id, planCredits);
        }

        return;
      } else {
        // Create new subscription if it doesn't exist
        const current_period_start = new Date();
        let current_period_end = new Date();
        
        switch(payment_frequency_interval) {
          case 'Month':
            current_period_end.setMonth(current_period_end.getMonth() + 1);
            break;
          case 'Year':
            current_period_end.setFullYear(current_period_end.getFullYear() + 1);
            break;
          default:
            throw new Error(`Unsupported subscription interval: ${payment_frequency_interval}`);
        }

        const insertQuery = `
          INSERT INTO subscriptions (
            user_id,
            customer_id,
            subscription_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            subscription_interval,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;

        const insertValues = [
          user_id,
          customer.customer_id,
          subscription_id,
          product_id,
          status,
          current_period_start,
          current_period_end,
          payment_frequency_interval
        ];

        const result = await db.query(insertQuery, insertValues);
        console.log('Created new subscription with Payment Successful status:', result.rows[0]);

        // Add credits if active
        if (status === 'active') {
          await this.addUserCredits(customer.customer_id, planCredits);
        }
      }

    } catch (error) {
      console.error('Subscription processing error:', error);
      throw error;
    }
  }

  async processPaymentWebhook(webhookData) {
    const {
      payment_id,
      subscription_id,
      total_amount,
      currency,
      tax,
      status,
      created_at
    } = webhookData.data;

    const customer = webhookData.data.customer;
    const payment_type = subscription_id ? 'subscription' : 'credit_pack';
    const credits_offered = payment_type === 'credit_pack' ? 
      Math.floor(((total_amount - tax) / 300) * 50) : 0;

    try {
      // Update customer_id in customers table based on email
      const updateCustomerQuery = `
        UPDATE customers 
        SET 
          customer_id = $1,
          updated_at = NOW()
        WHERE email = $2
        RETURNING user_id
      `;

      const customerResult = await db.query(updateCustomerQuery, [
        customer.customer_id,
        customer.email
      ]);

      if (customerResult.rows.length === 0) {
        throw new Error(`No customer found with email: ${customer.email}`);
      }

      const user_id = customerResult.rows[0].user_id;

      // Check if payment exists
      const checkPaymentQuery = `
        SELECT id FROM payments 
        WHERE payment_id = $1
      `;
      const existingPayment = await db.query(checkPaymentQuery, [payment_id]);

      if (existingPayment.rows.length > 0) {
        console.log('Payment already recorded, skipping');
        return;
      }

      // Insert payment
      const insertQuery = `
        INSERT INTO payments (
          customer_id,
          subscription_id,
          payment_id,
          amount,
          tax,
          currency,
          status,
          payment_type,
          credits_offered,
          created_at,
          updated_at,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(),$11)
        RETURNING *
      `;

      const values = [
        customer.customer_id,
        subscription_id,
        payment_id,
        total_amount,
        tax,
        currency,
        status,
        payment_type,
        credits_offered,
        created_at,
        user_id
      ];

      const result = await db.query(insertQuery, values);
      console.log(`Created new ${payment_type} payment record:`, result.rows[0]);

      // If it's a credit pack payment, update user's credits
      if (payment_type === 'credit_pack' && status === 'succeeded') {
        const updateUserCreditsQuery = `
          UPDATE "Users"
          SET image_credits = image_credits + $1 
          WHERE id = $2
          RETURNING image_credits
        `;
        await db.query(updateUserCreditsQuery, [credits_offered, user_id]);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async processFailedPaymentWebhook(webhookData) {
    const {
      payment_id,
      subscription_id,
      total_amount,
      currency,
      tax,
      status,
      created_at,
      failure_reason
    } = webhookData.data;

    const customer = webhookData.data.customer;
    const payment_type = subscription_id ? 'subscription' : 'credit_pack';

    try {
      // First update customer_id in customers table
      const updateCustomerQuery = `
        UPDATE customers 
        SET 
          customer_id = $1,
          updated_at = NOW()
        WHERE email = $2
        RETURNING user_id
      `;

      const customerResult = await db.query(updateCustomerQuery, [
        customer.customer_id,
        customer.email
      ]);

      if (customerResult.rows.length === 0) {
        throw new Error(`No customer found with email: ${customer.email}`);
      }

      const user_id = customerResult.rows[0].user_id;

      // Check if payment record exists
      const checkPaymentQuery = `
        SELECT id FROM payments 
        WHERE payment_id = $1
      `;
      const existingPayment = await db.query(checkPaymentQuery, [payment_id]);

      if (existingPayment.rows.length > 0) {
        console.log('Payment already recorded, skipping');
        return;
      }

      // Record failed payment
      const insertQuery = `
        INSERT INTO payments (
          customer_id,
          subscription_id,
          payment_id,
          amount,
          tax,
          currency,
          status,
          payment_type,
          failure_reason,
          created_at,
          updated_at,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
        RETURNING *
      `;

      const values = [
        customer.customer_id,
        subscription_id,
        payment_id,
        total_amount,
        tax,
        currency,
        'failed',
        payment_type,
        failure_reason || 'Unknown error',
        created_at,
        user_id
      ];

      const result = await db.query(insertQuery, values);
      console.log(`Recorded failed ${payment_type} payment:`, result.rows[0]);

    } catch (error) {
      console.error('Failed payment processing error:', error);
      throw error;
    }
  }

  async processFailedSubscriptionWebhook(webhookData) {
    const {
      subscription_id,
      customer,
      status,
      failure_reason,
      product_id
    } = webhookData.data;

    try {
      // First update customer_id in customers table
      const updateCustomerQuery = `
        UPDATE customers 
        SET 
          customer_id = $1,
          updated_at = NOW()
        WHERE email = $2
        RETURNING id
      `;

      const customerResult = await db.query(updateCustomerQuery, [
        customer.customer_id,
        customer.email
      ]);

      if (customerResult.rows.length === 0) {
        throw new Error(`Customer not found for email: ${customer.email}`);
      }

      // Now get user_id from customers table
      const getUserQuery = `
        SELECT user_id 
        FROM customers 
        WHERE customer_id = $1
      `;
      
      const userResult = await db.query(getUserQuery, [customer.customer_id]);
      
      if (userResult.rows.length === 0) {
        throw new Error(`No user found for customer_id: ${customer.customer_id}`);
      }

      const user_id = userResult.rows[0].user_id;

      // Check if subscription exists
      const checkQuery = `
        SELECT id FROM subscriptions 
        WHERE subscription_id = $1
      `;
      const existingSubscription = await db.query(checkQuery, [subscription_id]);

      if (existingSubscription.rows.length > 0) {
        // Update existing subscription
        const updateQuery = `
          UPDATE subscriptions 
          SET 
            status = $1,
            failure_reason = $2,
            updated_at = NOW()
          WHERE subscription_id = $3
            AND user_id = $4
          RETURNING *
        `;

        const result = await db.query(updateQuery, [
          'failed',
          failure_reason || 'Unknown error',
          subscription_id,
          user_id
        ]);

        console.log('Updated subscription status to failed:', result.rows[0]);
      } else {
        // Insert new failed subscription
        const insertQuery = `
          INSERT INTO subscriptions (
            user_id,
            customer_id,
            subscription_id,
            plan_id,
            status,
            failure_reason,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `;

        const result = await db.query(insertQuery, [
          user_id,
          customer.customer_id,
          subscription_id,
          product_id,
          'failed',
          failure_reason || 'Unknown error'
        ]);

        console.log('Created new failed subscription record:', result.rows[0]);
      }

      // // Update user's subscription plan to free
      // const updateUserQuery = `
      //   UPDATE "Users"
      //   SET subscription_plan = 'Trial'
      //   WHERE id = $1
      // `;
      
      // await db.query(updateUserQuery, [user_id]);

    } catch (error) {
      console.error('Failed subscription processing error:', error);
      throw error;
    }
  }

  // Helper method to update subscription status
  async updateSubscriptionStatus(subscription_id, status) {
    try {
      const updateQuery = `
        UPDATE subscriptions
        SET 
          status = $1,
          updated_at = NOW()
        WHERE subscription_id = $2
        RETURNING *
      `;

      const result = await db.query(updateQuery, [status, subscription_id]);
      console.log(`Updated subscription status to ${status}:`, result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Update subscription status error:', error);
      throw error;
    }
  }

  // Helper method to add credits
  async addUserCredits(customer_id, credits) {
    try {
      // First get the user_id from customers table
      const getUserQuery = `
        SELECT user_id 
        FROM customers 
        WHERE customer_id = $1
      `;
      
      const userResult = await db.query(getUserQuery, [customer_id]);
      
      if (userResult.rows.length === 0) {
        throw new Error(`No user found for customer_id: ${customer_id}`);
      }

      const user_id = userResult.rows[0].user_id;

      // Then update the user's credits
      const updateUserCreditsQuery = `
        UPDATE "Users"
        SET image_credits = COALESCE(image_credits, 0) + $1
        WHERE id = $2
        RETURNING image_credits
      `;

      const creditsResult = await db.query(updateUserCreditsQuery, [
        credits,
        user_id
      ]);

      if (creditsResult.rows.length === 0) {
        throw new Error(`Failed to update credits for user_id: ${user_id}`);
      }

      console.log(`Updated user credits. New balance: ${creditsResult.rows[0].image_credits}`);
      return creditsResult.rows[0].image_credits;

    } catch (error) {
      console.error('Error adding user credits:', error);
      throw error;
    }
  }
}

module.exports = WebhookService;
