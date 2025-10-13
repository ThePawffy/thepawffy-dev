const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// ✅ Import Routes
const userRoutes = require("./routes/user");
const lostPetRoutes = require("./routes/lostPet");
const foundPetRoutes = require("./routes/foundPet");
const bookingRoutes = require("./routes/booking");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/report");
const petRoutes = require("./routes/pet");

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

app.use(bodyParser.json());

// ✅ Register Routes
app.use("/api", userRoutes);
app.use("/api/lost-pets", lostPetRoutes);
app.use("/api/found-pets", foundPetRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);
app.use("/api/pets", petRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("Node.js + Firebase API is running 🚀");
});

// ✅ Error Handling Middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
