const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");

// ----------------------
// ✅ EXISTING CONTROLLERS
// ----------------------

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

// ----------------------
// ✅ ADDRESS CRUD CONTROLLERS
// ----------------------

// 📋 GET all addresses
const getAllAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists)
      return res.status(404).json({ success: false, message: "User not found" });

    const data = userDoc.data();
    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      addresses: data.addresses || [],
      selectedAddress: data.selectedAddress || null,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ➕ ADD new address
const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    if (!userId || !address)
      return res.status(400).json({
        success: false,
        message: "userId and address are required",
      });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists)
      return res.status(404).json({ success: false, message: "User not found" });

    const data = userDoc.data();
    const addresses = data.addresses || [];

    const newAddress = { id: Date.now().toString(), ...address };
    addresses.push(newAddress);

    await userRef.update({ addresses });

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✏️ UPDATE an address
const updateAddress = async (req, res) => {
  try {
    const { userId, addressId, updatedAddress } = req.body;
    if (!userId || !addressId || !updatedAddress)
      return res.status(400).json({
        success: false,
        message: "userId, addressId, and updatedAddress are required",
      });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists)
      return res.status(404).json({ success: false, message: "User not found" });

    const data = userDoc.data();
    const addresses = data.addresses || [];

    const index = addresses.findIndex((a) => a.id === addressId);
    if (index === -1)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });

    addresses[index] = { ...addresses[index], ...updatedAddress };

    await userRef.update({ addresses });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 🗑️ DELETE an address
const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    if (!userId || !addressId)
      return res.status(400).json({
        success: false,
        message: "userId and addressId are required",
      });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists)
      return res.status(404).json({ success: false, message: "User not found" });

    const data = userDoc.data();
    const addresses = data.addresses || [];

    const updatedAddresses = addresses.filter((a) => a.id !== addressId);
    await userRef.update({ addresses: updatedAddresses });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 🌟 SET selected address
const setSelectedAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    if (!userId || !addressId)
      return res.status(400).json({
        success: false,
        message: "userId and addressId are required",
      });

    const userRef = db.collection("users").doc(userId);
    await userRef.update({ selectedAddress: addressId });

    res.status(200).json({
      success: true,
      message: "Selected address updated successfully",
      selectedAddress: addressId,
    });
  } catch (error) {
    console.error("Error setting selected address:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ----------------------
// ✅ ROUTES
// ----------------------
router.get("/check-user-exists/:doc_id", checkUser);

// 🔹 ADDRESS CRUD ROUTES
router.get("/:userId/addresses", getAllAddresses);       // GET all addresses
router.post("/address/add", addAddress);                 // ADD address
router.put("/address/update", updateAddress);            // UPDATE address
router.delete("/address/delete", deleteAddress);         // DELETE address
router.post("/address/select", setSelectedAddress);      // SET selected address

module.exports = router;
