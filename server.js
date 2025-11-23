// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// ✅ Import Routes
const authRoutes = require("./routes/auth");
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
const vetBookingRoutes = require("./routes/vetBookingRoutes");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ------------------------------------------------------------
// ✅ STEP 1 — Enable CORS
// ------------------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://thepawffy-dev.onrender.com",
      "https://pawrescue-orpin.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ------------------------------------------------------------
// ✅ STEP 2 — Apple Pay Verification File Hosting
// ------------------------------------------------------------
// Must serve the `.well-known` folder publicly.
// Required by Stripe for Apple Pay domain verification.
app.use(
  "/.well-known",
  express.static(path.join(__dirname, ".well-known"), {
    dotfiles: "allow", // allow .well-known
  })
);

// ------------------------------------------------------------
// ✅ STEP 3 — Stripe Webhook (Raw body BEFORE express.json())
// ------------------------------------------------------------
app.use(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentRoutes
);

// ------------------------------------------------------------
// ✅ STEP 4 — JSON Parser for all other routes
// ------------------------------------------------------------
app.use(bodyParser.json());

// ------------------------------------------------------------
// ✅ STEP 5 — API Routes
// ------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/lost-pets", lostPetRoutes);
app.use("/api/found-pets", foundPetRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);
app.use("/api/pets", petRoutes);
app.use("/api", animalRoutes);
app.use("/api", vendorSearchRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", vetBookingRoutes);

// ------------------------------------------------------------
// ✅ Health Check Route
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("🐾 The Pawffy Node.js + Firebase API is running successfully 🚀");
});

// ------------------------------------------------------------
// ✅ Error Handler
// ------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------
// ✅ Start Server
// ------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
