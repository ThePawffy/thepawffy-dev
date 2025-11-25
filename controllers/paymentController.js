require("dotenv").config();
const Stripe = require("stripe");
const { db } = require("../config/firebase");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Checkout Session (with deep link success_url)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, customerEmail, description } = req.body;

    if (!amount || !currency || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "amount, currency, and customerEmail are required",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "IN", "CA", "GB", "AU"],
      },
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || "Custom Payment",
              tax_code: "txcd_99999999",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],

      // 🔴 OLD:
      // success_url: `https://your-frontend-domain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `https://your-frontend-domain.com/payment-cancelled`,

      // ✅ NEW: deep links for iOS app
      success_url: `pawffy://payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `pawffy://payment-cancelled`,
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

