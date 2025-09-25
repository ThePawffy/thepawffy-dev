const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const lostPetRoutes = require("./routes/lostPet");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);
app.use("/api/lost-pets", lostPetRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Node.js + Firebase API is running 🚀");
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
