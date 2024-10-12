const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const ContentHistory = sequelize.define('ContentHistory', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  // Add any other fields you had in your Mongoose model
});

module.exports = ContentHistory;
