// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

// ✅ Import Routes
const userRoutes = require("./routes/user");
const lostPetRoutes = require("./routes/lostPet");
const foundPetRoutes = require("./routes/foundPet");
const bookingRoutes = require("./routes/booking");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/report");
const petRoutes = require("./routes/pet");
const animalRoutes = require("./routes/animal");
const vendorSearchRoutes = require("./routes/vendorSearch");
const paymentRoutes = require("./routes/payment");

// ✅ Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ✅ Enable CORS before routes
app.use(
  cors({
    origin: [
      "http://localhost:3000",               // Local dev
      "https://thepawffy-dev.onrender.com",  // Backend (Render)
      "https://pawrescue-orpin.vercel.app",  // Frontend (Vercel)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ 1. Stripe Webhook route MUST be placed BEFORE express.json()
// Stripe needs the raw body for signature verification
app.use(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentRoutes
);

// ✅ 2. Use JSON parser for all other routes
app.use(bodyParser.json());

// ✅ 3. Initialize Clerk middleware globally (adds req.auth if token present)
app.use(ClerkExpressWithAuth());

// ✅ 4. Public Routes (no Clerk auth required)
app.use("/api", userRoutes);
app.use("/api", reportRoutes);
app.use("/api", vendorSearchRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ 5. Protected Routes (Clerk authentication required)
app.use("/api/lost-pets", ClerkExpressRequireAuth(), lostPetRoutes);
app.use("/api/found-pets", ClerkExpressRequireAuth(), foundPetRoutes);
app.use("/api/bookings", ClerkExpressRequireAuth(), bookingRoutes);
app.use("/api/pets", ClerkExpressRequireAuth(), petRoutes);
app.use("/api", ClerkExpressRequireAuth(), dashboardRoutes);
app.use("/api", ClerkExpressRequireAuth(), animalRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🐾 The Pawffy Node.js + Clerk + Firebase API is running successfully 🚀");
});

// ✅ Error Handling Middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
