const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { createCheckoutSession, handleWebhook } = require("../controllers/paymentController");

// ⚠️ Stripe webhook requires raw body (not parsed by express.json)
router.post("/create-checkout-session", createCheckoutSession);
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

module.exports = router;
