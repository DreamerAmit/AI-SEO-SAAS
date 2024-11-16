const asyncHandler = require('express-async-handler');
const pool = require('../config/database.js');
const {QueryTypes} = require('sequelize');

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


const getRemainingCredits = async (req, res) => {
    
    try {
        console.log('User from request:', req.user);
        
        const userId = req.user.id;
        console.log('Attempting to fetch credits for userId:', userId);
        
        const result = await pool.query(
            'SELECT * FROM "Users" WHERE id = :userId',
            {
                replacements: { userId: userId },
                type: QueryTypes.SELECT
              }
          //  [userId]
        );
        
        console.log('Database result:', result);

    
        res.status(200).json({
            success: true,
            imageCredits: result[0].image_credits,
         
        });
        console.log('Credits:', result[0].image_credits);
    } catch (error) {
        console.error('Server error details:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            message: "Error fetching credits",
            error: error.message
        });
    }
};

const deductCredits = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const amount = parseInt(req.body.usedCredits);

        console.log('Deducting credits:', { userId, amount });

        const result = await pool.query(
            'UPDATE "Users" SET image_credits = image_credits - :amount WHERE id = :userId AND image_credits >= :amount RETURNING *',
            {
                replacements: {
                    amount: amount,
                    userId: userId
                },
                type: QueryTypes.UPDATE
            }
        );

        console.log('Update result:', result);

        if (result[1] === 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient credits"
            });
        }

        res.status(200).json({
            success: true,
            remainingCredits: result[0].image_credits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deducting credits",
            error: error.message
        });
    }
});

console.log('Exporting controllers:', { getRemainingCredits, deductCredits });

module.exports = {
    getRemainingCredits,
    deductCredits,
    checkAuth
};
