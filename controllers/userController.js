// controllers/userController.js
const { db } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");
const { Clerk } = require("@clerk/clerk-sdk-node");

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/* ---------------------- 🔹 SEND OTP (Clerk) ---------------------- */
exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Step 1: Create a sign-in attempt in Clerk
    const signInAttempt = await clerk.signIns.create({
      identifier: phoneNumber,
    });

    // Step 2: Send OTP to phone
    await clerk.signIns.prepareFirstFactor({
      signInId: signInAttempt.id,
      strategy: "phone_code",
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      signInId: signInAttempt.id,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/* ---------------------- 🔹 VERIFY OTP (Clerk + Firebase Sync) ---------------------- */
exports.verifyOtp = async (req, res) => {
  try {
    const { signInId, code } = req.body;

    if (!signInId || !code) {
      return res.status(400).json({
        success: false,
        message: "signInId and code are required",
      });
    }

    // Step 1: Verify OTP with Clerk
    const verifiedSignIn = await clerk.signIns.attemptFirstFactor({
      signInId,
      strategy: "phone_code",
      code,
    });

    // Step 2: If verification complete, get Clerk user
    if (verifiedSignIn.status === "complete") {
      const session = verifiedSignIn.createdSession;
      const clerkUser = await clerk.users.getUser(session.userId);
      const userId = clerkUser.id;
      const phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber;

      // Step 3: Sync with Firebase
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const dummy = getDummyUser(userId);
        dummy.phoneNumber = phoneNumber;
        await userRef.set(dummy);
      }

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        user: { id: userId, phoneNumber },
      });
    }

    return res.status(400).json({
      success: false,
      message: "OTP verification failed or expired",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

/* ---------------------- ✅ CHECK USER STATUS ---------------------- */
exports.checkUser = async (req, res) => {
  try {
    const { doc_id } = req.params;
    const userRef = db.collection("users").doc(doc_id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const dummyUser = getDummyUser(doc_id);
      await userRef.set(dummyUser);
      return res.status(200).json({
        success: false,
        message: "User not found, dummy created",
        user: dummyUser,
      });
    }

    const userData = userDoc.data();
    const hasContactInfo = userData.email || userData.phoneNumber;
    const hasBasicDetails = userData.name && userData.description;

    if (!hasContactInfo || !hasBasicDetails) {
      return res.status(200).json({
        success: false,
        message: "Please complete the registration process",
        user: userData,
      });
    }

    if (!Array.isArray(userData.addresses) || userData.addresses.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Please add your address to complete registration",
        user: userData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User exists and registration is complete",
      user: userData,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/* ---------------------- ✅ UPSERT USER ---------------------- */
exports.upsertUser = async (req, res) => {
  try {
    const userData = req.body;
    const docId = userData.id;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    const hasContactInfo = userData.email || userData.phoneNumber;
    const hasBasicDetails = userData.name && userData.description;

    if (!hasContactInfo || !hasBasicDetails) {
      return res.status(400).json({
        success: false,
        message:
          "User must have either email or phone number, along with name and description",
      });
    }

    const userRef = db.collection("users").doc(docId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update(userData);
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: { id: docId, ...userData },
      });
    }

    await userRef.set(userData);
    return res.status(200).json({
      success: true,
      message: "User created successfully",
      user: { id: docId, ...userData },
    });
  } catch (error) {
    console.error("Error upserting user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/* ---------------------- ✅ GET USER ADDRESS ---------------------- */
exports.getUserAddress = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const userRef = db.collection("users").doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = doc.data();
    return res.status(200).json({
      success: true,
      message: "User address fetched successfully",
      data: {
        addresses: userData.addresses || [],
        selectedAddress: userData.selectedAddress || null,
      },
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* ---------------------- ✅ ADD NEW ADDRESS ---------------------- */
exports.addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: "userId and address are required",
      });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userDoc.data();
    const addresses = Array.isArray(userData.addresses)
      ? userData.addresses
      : [];

    const newAddress = { id: Date.now().toString(), ...address };
    addresses.push(newAddress);

    await userRef.update({
      addresses,
      selectedAddress: newAddress,
    });

    return res.status(200).json({
      success: true,
      message: "Address added successfully and set as selected",
      addresses,
      selectedAddress: newAddress,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
      error: error.message,
    });
  }
};
