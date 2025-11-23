const express = require("express");
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require("../controllers/paymentController");

// ------------------------------------------------------------
// ⚠️ IMPORTANT
// Do NOT use bodyParser.raw() here.
// Raw body for the webhook is handled ONLY in server.js.
// ------------------------------------------------------------

// Create Checkout Session
router.post("/create-checkout-session", createCheckoutSession);

// Webhook route (server.js already applies raw body)
router.post("/webhook", handleWebhook);

module.exports = router;
