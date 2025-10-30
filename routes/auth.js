const express = require("express");
const router = express.Router();
const { clerkLogin } = require("../controllers/authController");
const verifyClerkToken = require("../middleware/verifyClerkToken");

// ✅ POST /api/auth/clerk-login
router.post("/clerk-login", verifyClerkToken, clerkLogin);

module.exports = router;
