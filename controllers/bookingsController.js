// controllers/bookingsController.js
const { db } = require('../config/firebase');
const { validateBookingPayload } = require('../validators/bookingValidator');

/**
 * Helper to format API responses
 */
function successResponse(res, message, data = null, code = 200) {
  return res.status(code).json({ success: true, message, data });
}

function notFoundError(msg = 'Not found') {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
}

exports.createBooking = async (req, res, next) => {
  // Validate payload
  const { error } = validateBookingPayload(req.body);
  if (error) {
    const err = new Error('Validation Error: ' + error.message);
    err.statusCode = 400;
    throw err;
  }

  const payload = { ...req.body };

  // Create a new doc ref (auto id) and set bookingId field to that id
  const docRef = db.collection('bookings').doc();
  payload.bookingId = docRef.id;

  // If createdAt/bookedAt are not provided, set server timestamps (but spec said required)
  // Keep values as strings if passed.

  // Save data (preserve nested objects as-is)
  await docRef.set(payload, { merge: true });

  // Return created booking
  const savedDoc = await docRef.get();
  return successResponse(res, 'Booking created', { id: docRef.id, ...savedDoc.data() }, 201);
};

exports.getAllBookings = async (req, res, next) => {
  const snapshot = await db.collection('bookings').get();
  const bookings = [];
  snapshot.forEach((doc) => bookings.push({ id: doc.id, ...doc.data() }));
  return successResponse(res, 'Bookings fetched', bookings);
};

exports.getBookingById = async (req, res, next) => {
  const id = req.params.id;
  const docRef = db.collection('bookings').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) throw notFoundError('Booking not found');

  return successResponse(res, 'Booking fetched', { id: doc.id, ...doc.data() });
};

exports.updateBooking = async (req, res, next) => {
  const id = req.params.id;
  // Optional: validate update body similarly, here we'll allow partial updates but run validation where required fields are present
  const payload = { ...req.body };

  const docRef = db.collection('bookings').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw notFoundError('Booking not found');

  // Do NOT overwrite bookingId if present in DB. If payload contains bookingId different, ignore or keep original.
  if (payload.bookingId && payload.bookingId !== doc.id) {
    // override to original
    payload.bookingId = doc.id;
  }

  await docRef.set(payload, { merge: true }); // merge true for partial updates

  const updatedDoc = await docRef.get();
  return successResponse(res, 'Booking updated', { id: updatedDoc.id, ...updatedDoc.data() });
};

exports.deleteBooking = async (req, res, next) => {
  const id = req.params.id;
  const docRef = db.collection('bookings').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw notFoundError('Booking not found');

  await docRef.delete();
  return successResponse(res, 'Booking deleted', { id });
};
