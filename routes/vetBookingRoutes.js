// routes/vetBookingRoutes.js
const express = require("express");
const router = express.Router();

const {
  createVetBooking,
} = require("../controllers/vetBookingController");

// POST /api/bookings/veterinarian
router.post("/veterinarian", createVetBooking);

module.exports = router;
