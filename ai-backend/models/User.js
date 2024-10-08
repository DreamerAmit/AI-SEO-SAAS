const mongoose = require("mongoose");

//Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmationToken: String,
    confirmationTokenExpires: Date,
    trialPeriod: {
      type: Number,
      default: 3, //3 days
    },
    trialActive: {
      type: Boolean,
      default: true,
    },
    trialExpires: {
      type: Date,
    },
    subscriptionPlan: {
      type: String,
      enum: ["Trial", "Free", "Basic", "Premium"],
      default: "Trial",
    },
    apiRequestCount: {
      type: Number,
      default: 0,
    },
    monthlyRequestCount: {
      type: Number,
      default: 100, //100 credit //3 days
    },
    nextBillingDate: Date,
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    contentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ContentHistory",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//! Compile to form the model
const User = mongoose.model("User", userSchema);

module.exports = User;
