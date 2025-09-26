// routes/bookings.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const bookingsController = require('../controllers/bookingsController');

router.post('/', asyncHandler(bookingsController.createBooking));
router.get('/', asyncHandler(bookingsController.getAllBookings));
router.get('/:id', asyncHandler(bookingsController.getBookingById));
router.put('/:id', asyncHandler(bookingsController.updateBooking));
router.delete('/:id', asyncHandler(bookingsController.deleteBooking));

module.exports = router;
