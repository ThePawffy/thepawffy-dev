// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Routes
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
const vetBookingRoutes = require("./routes/vetBookingRoutes");
const paymentRoutes = require("./routes/payment");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://thepawffy-dev.onrender.com",
      "https://pawrescue-orpin.vercel.app",
      "https://thepawffy-dev.fly.dev",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ------------------------------------------------------------
// Serve Apple Pay Verification File
// ------------------------------------------------------------
app.use(
  "/.well-known",
  express.static(path.join(__dirname, ".well-known"), { dotfiles: "allow" })
);

// ------------------------------------------------------------
// **STRIPE WEBHOOK MUST BE RAW BODY AND ISOLATED**
// ------------------------------------------------------------
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  require("./controllers/paymentController").handleWebhook
);

// ------------------------------------------------------------
// JSON BODY PARSER FOR EVERYTHING ELSE
// ------------------------------------------------------------
app.use(bodyParser.json());

// ------------------------------------------------------------
// API Routes
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
app.use("/api/bookings", vetBookingRoutes);
app.use("/api/payments", paymentRoutes); // create-checkout-session lives here

// ------------------------------------------------------------
// Health Check
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("🐾 The Pawffy Node.js + Firebase API is running successfully 🚀");
});

// ------------------------------------------------------------
// Error Handler
// ------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

