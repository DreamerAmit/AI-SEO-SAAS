require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, query } = require('./connectDB');
const userRoutes = require('./routes/usersRouter');
const sequelize = require('./config/database');
const { Pool } = require('pg');
const openAIRouter = require('./routes/openAIRouter');
const imageRouter = require('./routes/imageRouter');
const creditRoutes = require('./routes/creditRoutes');
// const scrapeRouter = require('./routes/scrapeRouter');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// CORS configuration
const allowedOrigins = ['http://localhost:3002', 'http://localhost:3001', 'http://localhost:3000','http://pic2alt.com','https://pic2alt.com'];

app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    callback(null, true); // Allow all origins temporarily
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow all methods
  credentials: true
}));

// Add this middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

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
app.use('/api/v1/openai', openAIRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/credits', creditRoutes);
app.use('/api/v1/email', emailRoutes);


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

const PORT = process.env.PORT;

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

// Catch-all for unmatched routes
app.use((req, res, next) => {
  console.log(`No route matched for ${req.method} ${req.url}`);
  res.status(404).send('Not Found');
});


// app.use('/api/scrape', scrapeRouter);
