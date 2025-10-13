const { db, admin } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");

// =======================
// ✅ USER CHECK & UPSERT
// =======================

// 🔹 Check user or create dummy
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
        message: "User not found, dummy created.",
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
        message: "Please add at least one address",
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

// 🔹 Upsert user data
exports.upsertUser = async (req, res) => {
  try {
    const userData = req.body;
    const docId = userData.id;

    if (!docId) {
      return res.status(400).json({ success: false, message: "id is required" });
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
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// =======================
// ✅ ADDRESS CRUD
// =======================

// 🔹 READ: Get all addresses and selectedAddress
exports.getUserAddress = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "id is required" });

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ success: false, message: "User not found" });

    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      message: "User addresses fetched successfully",
      data: {
        addresses: userData.addresses || [],
        selectedAddress: userData.selectedAddress || null,
      },
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// 🔹 CREATE: Add a new address
exports.addUserAddress = async (req, res) => {
  try {
    const { id, newAddress } = req.body;

    if (!id || !newAddress) return res.status(400).json({ success: false, message: "id and newAddress are required" });

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ success: false, message: "User not found" });

    await userRef.update({
      addresses: admin.firestore.FieldValue.arrayUnion(newAddress),
    });

    return res.status(200).json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// 🔹 UPDATE: Update an address by index or change selectedAddress
exports.updateUserAddress = async (req, res) => {
  try {
    const { id, addressIndex, updatedAddress, selectedAddress } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "id is required" });

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ success: false, message: "User not found" });

    const userData = userDoc.data();
    let updateData = {};

    if (selectedAddress) updateData.selectedAddress = selectedAddress;

    if (
      typeof addressIndex === "number" &&
      Array.isArray(userData.addresses) &&
      userData.addresses[addressIndex] &&
      updatedAddress
    ) {
      const updatedAddresses = [...userData.addresses];
      updatedAddresses[addressIndex] = updatedAddress;
      updateData.addresses = updatedAddresses;
    }

    await userRef.update(updateData);

    return res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// 🔹 DELETE: Remove address by index
exports.deleteUserAddress = async (req, res) => {
  try {
    const { id, addressIndex } = req.body;

    if (!id || typeof addressIndex !== "number")
      return res.status(400).json({ success: false, message: "id and valid addressIndex are required" });

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ success: false, message: "User not found" });

    const userData = userDoc.data();

    if (!Array.isArray(userData.addresses) || !userData.addresses[addressIndex])
      return res.status(404).json({ success: false, message: "Address not found" });

    const updatedAddresses = userData.addresses.filter((_, idx) => idx !== addressIndex);

    await userRef.update({ addresses: updatedAddresses });

    return res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
