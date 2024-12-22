const db = require('../connectDB');

class PaymentService {
  async createCustomer(userData) {
   // const client = await db.connect();
    
    try {
      await db.query('BEGIN');

      // Create customer record in database
      const { rows: [customer] } = await db.query(
        `INSERT INTO customers (
          user_id,
          customer_external_id,
          email,
          name,
          firstName,
          lastName,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING user_id, customer_external_id, email, name, firstName, lastName, created_at, updated_at`,
        [
          userData.user_id,
          userData.user_id,
          userData.email,
          userData.name,
          userData.firstName,
          userData.lastName
        ]
      );

      await db.query('COMMIT');

      return {
        user_id: customer.user_id,
        customer_external_id: customer.customer_external_id, // Using internal ID since we're not using Dodo
        email: customer.email,
        name: customer.name,
        firstName: customer.firstName,
        lastName: customer.lastName
      };

    } catch (error) {
      console.error('PaymentService: Error creating customer:', error);
      console.error('PaymentService: Error stack:', error.stack);
      throw error;
    } 
  }
}

module.exports = PaymentService;
