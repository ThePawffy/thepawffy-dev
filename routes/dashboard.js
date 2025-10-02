// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Combined API
router.post("/dashboard", dashboardController.dashboard);

// Separate APIs
router.get("/users/:id", dashboardController.getUserById);
router.post("/partners", dashboardController.getPartnersNearby); // expects { latitude, longitude }
router.get("/notifications/:id", dashboardController.getNotificationsById);
router.get("/categories", dashboardController.getActiveCategories);

module.exports = router;
