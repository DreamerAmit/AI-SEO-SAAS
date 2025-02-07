require('dotenv').config();
const express = require('express');
const { connectDB, query } = require('./connectDB');
const userRoutes = require('./routes/usersRouter');
const sequelize = require('./config/database');
const { Pool } = require('pg');
const openAIRouter = require('./routes/openAIRouter');
const imageRouter = require('./routes/imageRouter');
const creditRoutes = require('./routes/creditRoutes');
// const scrapeRouter = require('./routes/scrapeRouter');
const emailRoutes = require('./routes/emailRoutes');
const webhookRoutes = require('./routes/webhook');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const fs = require('fs');

const app = express();

// Update CORS configuration
const allowedOrigins = [
  'http://localhost:3002', 
  'http://localhost:3001', 
  'http://localhost:3000',
  'http://pic2alt.com',
  'https://pic2alt.com',
  'https://bc93-2405-204-901b-aaa3-ca6-7ce5-9b2c-196a.ngrok-free.app'
];

// Replace your existing CORS configuration with this:
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log the origin for debugging
  console.log('Request origin:', origin);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.status(200).end();
    return;
  }

  next();
});

// Add this middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/payments', paymentRoutes);

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

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Catch-all for unmatched routes
app.use((req, res, next) => {
  console.log(`No route matched for ${req.method} ${req.url}`);
  res.status(404).send('Not Found');
});

// Ensure uploads directory exists with absolute path
const uploadDir = path.join(process.cwd(), 'uploads');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

// Add a test endpoint
app.get('/test-upload-dir', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            uploadDir,
            files,
            exists: fs.existsSync(uploadDir)
        });
    });
});

// app.use('/api/scrape', scrapeRouter);
