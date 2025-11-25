const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");
const { walkingBookingSchema } = require("../models/walkingBookingModel");

exports.createWalkingBooking = asyncHandler(async (req, res) => {
  try {
    const partnerID = req.body.partnerID || req.body.partnerId;

    // Support both PaymentStatus and paymentStatus
    const PaymentStatus =
      req.body.PaymentStatus || req.body.paymentStatus || "pending";

    // Build validation object from raw input (before Firestore formatting)
    const validationData = {
      selectedAddress: req.body.selectedAddress,
      selectedDays: req.body.selectedDays,
      selectedPetList: req.body.selectedPetList,
      selectedService: req.body.selectedService,
      selectedPackage: req.body.selectedPackage || {},
      isPackage: req.body.isPackage,
      userId: req.body.userId,
      vendorID: partnerID, // mapped for schema
      bookingType: req.body.bookingType,
      walkingType: req.body.walkingType,
      slotTime: req.body.slotTime,
      walkingDuration: req.body.walkingDuration,
      PaymentStatus,
    };

    // Joi Validation
    const { error } = walkingBookingSchema.validate(validationData);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        details: error.details[0].message,
      });
    }

    const {
      selectedAddress,
      selectedDays,
      selectedPetList,
      selectedService,
      selectedPackage = {},
      isPackage,
      userId,
      bookingType,
      walkingType,
      slotTime,
      walkingDuration,
    } = req.body;

    // Fetch user & partner details
    const userRef = db.collection("users").doc(userId);
    const partnerRef = db.collection("users").doc(partnerID);

    const [userSnap, partnerSnap] = await Promise.all([
      userRef.get(),
      partnerRef.get(),
    ]);

    const userData = userSnap.exists ? userSnap.data() : {};
    const partnerData = partnerSnap.exists ? partnerSnap.data() : {};

    // Final slot logic for Firestore
    let finalSlot = {};
    if (walkingType === "Once a day") {
      finalSlot = {
        morningSlot: slotTime?.morningSlot || "",
      };
    } else if (walkingType === "Twice a day") {
      finalSlot = {
        morningSlot: slotTime?.morningSlot || "",
        eveningSlot: slotTime?.eveningSlot || "",
      };
    }

    // Build booking object for Firestore
    const bookingData = {
      bookingType,
      walkingType,
      selectedDays,
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage,
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

    res.status(201).json({
      success: true,
      message: "Walking booking created successfully",
      bookingId: newBookingRef.id,
      data: bookingData,
    });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message,
    });
  }
});
