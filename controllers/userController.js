const { db, admin } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");

// ✅ CHECK USER STATUS OR CREATE DUMMY
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
        message: "User not found",
        user: dummyUser,
      });
    }

    const userData = userDoc.data();

    // ✅ Required fields check
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

    // ✅ Check addresses
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

// ✅ UPSERT USER DATA
exports.upsertUser = async (req, res) => {
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

// ✅ READ: Get addresses and selectedAddress by user ID
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

// ✅ CREATE: Add a new address
exports.addUserAddress = async (req, res) => {
  try {
    const { id, newAddress } = req.body;

    if (!id || !newAddress) {
      return res.status(400).json({
        success: false,
        message: "User ID and newAddress are required",
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

    await userRef.update({
      addresses: admin.firestore.FieldValue.arrayUnion(newAddress),
    });

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ UPDATE: Modify an address or selectedAddress
exports.updateUserAddress = async (req, res) => {
  try {
    const { id, addressIndex, updatedAddress, selectedAddress } = req.body;

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
    let updatedData = {};

    // Update selectedAddress if provided
    if (selectedAddress) updatedData.selectedAddress = selectedAddress;

    // Update address by index
    if (
      typeof addressIndex === "number" &&
      updatedAddress &&
      Array.isArray(userData.addresses) &&
      userData.addresses[addressIndex]
    ) {
      const updatedAddresses = [...userData.addresses];
      updatedAddresses[addressIndex] = updatedAddress;
      updatedData.addresses = updatedAddresses;
    }

    await userRef.update(updatedData);

    return res.status(200).json({
      success: true,
      message: "Address or selectedAddress updated successfully",
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ DELETE: Remove an address by index
exports.deleteUserAddress = async (req, res) => {
  try {
    const { id, addressIndex } = req.body;

    if (!id || typeof addressIndex !== "number") {
      return res.status(400).json({
        success: false,
        message: "User ID and valid addressIndex are required",
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

    if (!Array.isArray(userData.addresses) || !userData.addresses[addressIndex]) {
      return res.status(404).json({
        success: false,
        message: "Address not found at given index",
      });
    }

    const updatedAddresses = userData.addresses.filter(
      (_, idx) => idx !== addressIndex
    );

    await userRef.update({ addresses: updatedAddresses });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
