require("dotenv").config();
const Stripe = require("stripe");
const { db } = require("../config/firebase");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Checkout Session (with Apple Pay + Automatic Tax)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, customerEmail, description } = req.body;

    if (!amount || !currency || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "amount, currency, and customerEmail are required",
      });
    }

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // ✅ Payment methods include Apple Pay, Google Pay, etc. (via "card")
      payment_method_types: ["card"],

      customer_email: customerEmail,

      // ✅ Enable automatic tax calculation
      automatic_tax: { enabled: true },

      // ✅ Optional: Collect billing/shipping for accurate tax
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "IN", "CA", "GB", "AU"], // adjust to your target countries
      },

      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || "Custom Payment",
              tax_code: "txcd_99999999", // optional Stripe tax code (customize per product type)
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],

      // ✅ Dynamic URLs (use your real frontend URLs)
      success_url: `https://your-frontend-domain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://your-frontend-domain.com/payment-cancelled`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Handle Stripe Webhook (unchanged)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // FIXED
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await db.collection("payments").add({
        email: session.customer_email,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        payment_status: session.payment_status,
        session_id: session.id,
        createdAt: new Date(),
      });

      console.log("✅ Saved payment for:", session.customer_email);
    } catch (error) {
      console.error("❌ Firestore error:", error);
    }
  }

  res.json({ received: true });
};

