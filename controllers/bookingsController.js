const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");

exports.createWalkingBooking = asyncHandler(async (req, res) => {
  try {
    // Support both partnerID and partnerId
    const partnerID = req.body.partnerID || req.body.partnerId;

    // Support both PaymentStatus and paymentStatus
    const PaymentStatus =
      req.body.PaymentStatus || req.body.paymentStatus || "pending";

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

    // Validate required fields
    if (!userId || !partnerID || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, partnerID, bookingType",
      });
    }

    // Fetch user and partner info
    const userRef = db.collection("users").doc(userId);
    const partnerRef = db.collection("users").doc(partnerID);

    const [userSnap, partnerSnap] = await Promise.all([
      userRef.get(),
      partnerRef.get(),
    ]);

    const userData = userSnap.exists ? userSnap.data() : {};
    const partnerData = partnerSnap.exists ? partnerSnap.data() : {};

    // Final slot logic
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

    // Build booking data
    const bookingData = {
      bookingType: bookingType || "walking",
      walkingType,
      selectedDays,
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage: isPackage || false,
      walkingDuration,
      PaymentStatus,
      selectedAddress: selectedAddress || userData.address || {},
      slotTime: finalSlot,
      userDetails: {
        userId,
        ...userData,
      },
      partnerDetails: {
        partnerID,
        ...partnerData,
      },
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
