require("dotenv").config();
const Stripe = require("stripe");
const { db } = require("../config/firebase");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Checkout Session
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
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || "Custom Payment",
            },
            unit_amount: Math.round(amount * 100), // convert ₹ to paise or $ to cents
          },
          quantity: 1,
        },
      ],
      success_url: `https://your-frontend-domain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://your-frontend-domain.com/payment-cancelled`,
    });

    // ✅ Send session URL to frontend
    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Handle Stripe Webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Stripe requires RAW body for webhook validation
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 💰 Handle successful payment event
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

      console.log("✅ Payment saved in Firestore:", session.customer_email);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
    }
  }

  res.json({ received: true });
};
