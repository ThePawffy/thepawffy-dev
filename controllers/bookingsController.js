const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/bookings/walking
exports.createWalkingBooking = asyncHandler(async (req, res) => {
  try {
    const {
      selectedAddress,
      selectedDays,
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage,
      userId,
      partnerID,
      bookingType,
      walkingType,
      slotTime,
      walkingDuration,
      PaymentStatus,
    } = req.body;

    if (!userId || !partnerID || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, partnerID, bookingType",
      });
    }

    // 🔹 Fetch user and partner data from Firebase
    const userRef = db.collection("users").doc(userId);
    const partnerRef = db.collection("users").doc(partnerID);

    const [userSnap, partnerSnap] = await Promise.all([
      userRef.get(),
      partnerRef.get(),
    ]);

    const userData = userSnap.exists ? userSnap.data() : {};
    const partnerData = partnerSnap.exists ? partnerSnap.data() : {};

    // 🔹 Slot time logic
    let finalSlot = {};
    if (walkingType === "Once a day") {
      finalSlot = { morningSlot: slotTime.morningSlot || "" };
    } else if (walkingType === "Twice a day") {
      finalSlot = {
        morningSlot: slotTime.morningSlot || "",
        eveningSlot: slotTime.eveningSlot || "",
      };
    }

    // 🔹 Merge all data
    const bookingData = {
      bookingType: bookingType || "walking",
      walkingType,
      selectedDays,
      selectedPetList,
      selectedService,
      selectedPackage,
      isPackage,
      walkingDuration,
      PaymentStatus: PaymentStatus || "Pending",
      selectedAddress: selectedAddress || userData.address || {},
      slotTime: finalSlot,
      userDetails: {
        userId,
        ...(userData || {}),
      },
      partnerDetails: {
        partnerID,
        ...(partnerData || {}),
      },
      createdAt: new Date().toISOString(),
    };

    // 🔹 Save to bookings collection
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
