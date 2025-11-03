// routes/booking.js
const express = require("express");
const router = express.Router();
const { createWalkingBooking } = require("../controllers/bookingsController");

router.post("/walking", createWalkingBooking);

module.exports = router;
