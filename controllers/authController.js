// controllers/authController.js
const { db } = require("../config/firebase");
const jwt = require("jsonwebtoken");

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store in Firestore with 5 min expiry
    await db.collection("otp").doc(phone).set({
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // You can integrate SMS service here (Twilio / Firebase Auth / MSG91)
    console.log(`OTP for ${phone}: ${otp}`);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const otpDoc = await db.collection("otp").doc(phone).get();

    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    const { otp: storedOtp, expiresAt } = otpDoc.data();

    if (Date.now() > expiresAt) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (parseInt(otp) !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP verified ✅ — Create or update user
    const userRef = db.collection("users").doc(phone);
    await userRef.set(
      {
        phone,
        verified: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Generate JWT token
    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Delete used OTP
    await db.collection("otp").doc(phone).delete();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
