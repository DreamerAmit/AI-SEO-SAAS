const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const creditController = require("../controllers/creditController.js");

console.log('Imported controller:', creditController);

const creditRouter = express.Router();

if (!creditController.getRemainingCredits) {
    throw new Error('getRemainingCredits is not defined in controller');
}
//creditRouter.get("/auth/check", creditController.checkAuth);
creditRouter.get("/remaining", isAuthenticated, creditController.getRemainingCredits);
creditRouter.post("/deduct", isAuthenticated, creditController.deductCredits);

module.exports = creditRouter;