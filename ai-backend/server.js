require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, query } = require('./connectDB');
const userRoutes = require('./routes/usersRouter');
const sequelize = require('./Config/database');
const { Pool } = require('pg');

const app = express();

// CORS configuration
const allowedOrigins = ['http://localhost:3002', 'http://localhost:3001', 'http://localhost:3000'];

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url, 'from origin:', req.headers.origin);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS origin:', origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ message: 'Database connected', time: result.rows[0].now });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ message: 'Database test failed', error: error.message });
  }
});

// Routes come after middleware
app.use('/api/v1/users', userRoutes);

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the database connection
const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Error connecting to the database', err);
  }
};

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    sequelize.sync({ force: false }) // Use { force: true } only in development to recreate tables
      .then(() => {
        console.log('Database & tables created!');
      });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

// Error handling middleware should come last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});
