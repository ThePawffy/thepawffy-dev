const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");
const { walkingBookingSchema } = require("../models/walkingBookingModel");

exports.createWalkingBooking = asyncHandler(async (req, res) => {
  try {
    // Normalize partner ID
    const partnerID = req.body.partnerID || req.body.partnerId;

    // Normalize payment status
    const PaymentStatus =
      req.body.PaymentStatus || req.body.paymentStatus || "pending";

    const {
      userId,
      bookingType,
      walkingType,
      slotTime,
      walkingDuration,
    } = req.body;

    // Basic required validation (before accessing Firestore)
    if (!userId || !partnerID || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, partnerID, bookingType",
      });
    }

    // Fetch user & partner BEFORE validation (needed for fallback address)
    const [userSnap, partnerSnap] = await Promise.all([
      db.collection("users").doc(userId).get(),
      db.collection("users").doc(partnerID).get(),
    ]);

    const userData = userSnap.exists ? userSnap.data() : {};
    const partnerData = partnerSnap.exists ? partnerSnap.data() : {};

    // Use request address OR fallback to user's saved address
    const selectedAddress = req.body.selectedAddress || userData.address || {};

    // Build validation object (MUST MATCH Joi schema)
    const validationData = {
      selectedAddress,
      selectedDays: req.body.selectedDays,
      selectedPetList: req.body.selectedPetList,
      selectedService: req.body.selectedService,
      selectedPackage: req.body.selectedPackage || {},
      isPackage: req.body.isPackage,
      userId,
      partnerID, // <-- updated according to new schema
      bookingType: bookingType || "walking",
      walkingType,
      slotTime: slotTime || {},
      walkingDuration,
      PaymentStatus,
    };

    // Validate with Joi
    const { error } = walkingBookingSchema.validate(validationData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        details: error.details[0].message,
      });
    }

    // Final slot logic (clean & reliable)
    const finalSlot =
      walkingType === "Twice a day"
        ? {
            morningSlot: slotTime?.morningSlot || "",
            eveningSlot: slotTime?.eveningSlot || "",
          }
        : {
            // Once a day
            morningSlot: slotTime?.morningSlot || "",
          };

    // Build Firestore booking entry
    const bookingData = {
      bookingType,
      walkingType,
      selectedDays: req.body.selectedDays,
      selectedPetList: req.body.selectedPetList,
      selectedService: req.body.selectedService,
      selectedPackage: req.body.selectedPackage || {},
      isPackage: req.body.isPackage || false,
      walkingDuration,
      PaymentStatus,
      selectedAddress,
      slotTime: finalSlot,
      userDetails: { userId, ...userData },
      partnerDetails: { partnerID, ...partnerData },
      createdAt: new Date().toISOString(),
    };

    // Save booking
    const newBookingRef = db.collection("bookings").doc();
    await newBookingRef.set(bookingData);

    return res.status(201).json({
      success: true,
      message: "Walking booking created successfully",
      bookingId: newBookingRef.id,
      data: bookingData,
    });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message,
    });
  }
});
