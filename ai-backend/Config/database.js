require('dotenv').config({ path: '../.env' });
const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in the environment variables');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Set to false in production
});

module.exports = sequelize;
