//routes/user.js
const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");

// ----------------------
// ✅ CONTROLLERS
// ----------------------

// 🔹 Check if user exists, else create dummy user
const checkUser = async (req, res) => {
  try {
    const { doc_id } = req.params;
    const userRef = db.collection("users").doc(doc_id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const dummyUser = getDummyUser(doc_id);
      await userRef.set(dummyUser);

      return res.status(200).json({
        success: false,
        message: "User not found, dummy created. Redirect to registration.",
        user: dummyUser,
      });
    }

    const userData = userDoc.data();

    // Required field validation
    const requiredFields = ["email", "phoneNumber", "name", "description"];
    for (let field of requiredFields) {
      if (!userData[field]) {
        return res.status(200).json({
          success: false,
          message: "Please complete the registration process",
          user: userData,
        });
      }
    }

    // Address validation
    if (!Array.isArray(userData.addresses) || userData.addresses.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Please complete the registration process",
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

// 🔹 Create or update user (upsert)
const upsertUser = async (req, res) => {
  try {
    const userData = req.body;
    const docId = userData.id;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Document id is required",
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
    } else {
      await userRef.set(userData);
      return res.status(200).json({
        success: true,
        message: "User created successfully",
        user: { id: docId, ...userData },
      });
    }
  } catch (error) {
    console.error("Error upserting user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 🔹 Fetch addresses and selectedAddress by ID
const getUserAddress = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const response = {
      addresses: userData.addresses || [],
      selectedAddress: userData.selectedAddress || null,
    };

    return res.status(200).json({
      success: true,
      message: "User addresses fetched successfully",
      data: response,
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

// ----------------------
// ✅ ROUTES
// ----------------------
router.get("/check-user-exists/:doc_id", checkUser);   // GET /api/user/check-user-exists/:doc_id
router.post("/upsert", upsertUser);                    // POST /api/user/upsert
router.post("/get-addresses", getUserAddress);      // POST /api/user/getUserAddresses

module.exports = router;
