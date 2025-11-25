const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");
const { walkingBookingSchema } = require("../models/walkingBookingModel");

exports.createWalkingBooking = asyncHandler(async (req, res) => {
  try {
    const partnerID = req.body.partnerID || req.body.partnerId;
    const PaymentStatus =
      req.body.PaymentStatus || req.body.paymentStatus || "pending";

    const {
      userId,
      partnerId, // optional - not required if partnerID used
      bookingType,
      walkingType,
      slotTime,
      walkingDuration,
    } = req.body;

    if (!userId || !partnerID || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, partnerID, bookingType",
      });
    }

    // Fetch user & partner BEFORE validation so we can use user's saved address if missing
    const userRef = db.collection("users").doc(userId);
    const partnerRef = db.collection("users").doc(partnerID);

    const [userSnap, partnerSnap] = await Promise.all([userRef.get(), partnerRef.get()]);
    const userData = userSnap.exists ? userSnap.data() : {};
    const partnerData = partnerSnap.exists ? partnerSnap.data() : {};

    // decide selectedAddress: prefer request, fall back to user's saved address
    const selectedAddress = req.body.selectedAddress || userData.address || {};

    // Build validation object
    const validationData = {
      selectedAddress,
      selectedDays: req.body.selectedDays,
      selectedPetList: req.body.selectedPetList,
      selectedService: req.body.selectedService,
      selectedPackage: req.body.selectedPackage || {},
      isPackage: req.body.isPackage,
      userId,
      vendorID: partnerID, // map to schema field name
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

    // Final slot logic for Firestore
    let finalSlot = {};
    if (walkingType === "Once a day") {
      finalSlot = { morningSlot: slotTime?.morningSlot || "" };
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
