const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

console.log('Starting database connection...');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: console.log // This will log all SQL queries
});

const connectDB = async () => {
  try {
    console.log('Attempting to authenticate...');
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    console.log('Connection attempt completed.');
  }
};

console.log('Calling connectDB function...');
connectDB();

console.log('Script execution completed.');