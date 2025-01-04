const db = require('../connectDB');

const createCheckoutSession = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    // Validate inputs
    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and User ID are required'
      });
    }

    // Store checkout session
    const insertQuery = `
      INSERT INTO checkout_sessions (
        user_id,
        plan_id,
        created_at
      )
      VALUES ($1, $2, NOW())
      RETURNING *
    `;

    const result = await db.query(insertQuery, [userId, productId]);

    console.log('Checkout session created:', result.rows[0]);

    res.json({
      success: true,
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
};

module.exports = {
  createCheckoutSession
};
