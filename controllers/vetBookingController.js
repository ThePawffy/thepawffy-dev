// controllers/vetBookingController.js
const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");
const { vetBookingSchema } = require("../models/vetBookingModel");

// POST /api/bookings/veterinarian
exports.createVetBooking = asyncHandler(async (req, res) => {
  try {
    // 🔹 Validate request body using Joi
    const { error } = vetBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.details[0].message,
      });
    }

    const {
      selectedAddress,
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage,
      userId,
      vendorID,
      bookingType,
      serviceType,
      PaymentStatus,
    } = req.body;

    // 🔹 Fetch user and vendor data from Firebase
    const userRef = db.collection("users").doc(userId);
    const vendorRef = db.collection("users").doc(vendorID);

    const [userSnap, vendorSnap] = await Promise.all([
      userRef.get(),
      vendorRef.get(),
    ]);

    const userData = userSnap.exists ? userSnap.data() : {};
    const vendorData = vendorSnap.exists ? vendorSnap.data() : {};

    // 🔹 Merge booking data
    const bookingData = {
      bookingType: bookingType || "veterinarian",
      serviceType, // Clinic / Vet Visit / Online
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage,
      PaymentStatus: PaymentStatus || "Pending",
      selectedAddress: selectedAddress || userData.address || {},

      userDetails: {
        userId,
        ...(userData || {}),
      },

      vendorDetails: {
        vendorID,
        ...(vendorData || {}),
      },

      createdAt: new Date().toISOString(),
    };

    // 🔹 Save booking to Firestore
    const newBookingRef = db.collection("bookings").doc();
    await newBookingRef.set(bookingData);

    res.status(201).json({
      success: true,
      message: "Veterinarian booking created successfully",
      bookingId: newBookingRef.id,
      data: bookingData,
    });
  } catch (error) {
    console.error("❌ Vet Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating veterinarian booking",
      error: error.message,
    });
  }
});
