const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this path as needed

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isEmailConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  confirmationToken: {
    type: DataTypes.STRING,
  },
  confirmationTokenExpires: {
    type: DataTypes.DATE,
  },
  trialPeriod: {
    type: DataTypes.INTEGER,
    defaultValue: 3, // 3 days
  },
  trialActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  trialExpires: {
    type: DataTypes.DATE,
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('Trial', 'Free', 'Basic', 'Premium'),
    defaultValue: 'Trial',
  },
  apiRequestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  monthlyRequestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 100, // 100 credit
  },
  nextBillingDate: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
});

// Define associations
User.associate = (models) => {
  User.hasMany(models.Payment, {
    foreignKey: 'userId',
    as: 'payments',
  });
  User.hasMany(models.ContentHistory, {
    foreignKey: 'userId',
    as: 'contentHistory',
  });
};

module.exports = User;
