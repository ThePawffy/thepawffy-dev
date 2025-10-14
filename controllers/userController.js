const { db } = require("../config/firebase");
const { getDummyUser } = require("../models/userModel");

// ----------------------
// EXISTING FUNCTIONS (unchanged)
// ----------------------
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
      message: "User address fetched successfully",
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
// ✅ NEW CRUD FUNCTIONS FOR ADDRESSES
// ----------------------

// ➕ CREATE Address
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const addresses = Array.isArray(userData.addresses) ? userData.addresses : [];

    // Add a unique ID for each address
    const newAddress = { id: Date.now().toString(), ...address };
    addresses.push(newAddress);

    await userRef.update({ addresses });

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses,
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

// ✏️ UPDATE Address
exports.updateAddress = async (req, res) => {
  try {
    const { userId, addressId, updatedAddress } = req.body;

    if (!userId || !addressId || !updatedAddress) {
      return res.status(400).json({
        success: false,
        message: "userId, addressId, and updatedAddress are required",
      });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const addresses = userData.addresses || [];

    const index = addresses.findIndex((a) => a.id === addressId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    addresses[index] = { ...addresses[index], ...updatedAddress };
    await userRef.update({ addresses });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
};

// 🗑️ DELETE Address
exports.deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "userId and addressId are required",
      });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const addresses = (userData.addresses || []).filter((a) => a.id !== addressId);

    await userRef.update({ addresses });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

// 🌟 SET Selected Address
exports.setSelectedAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "userId and addressId are required",
      });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await userRef.update({ selectedAddress: addressId });

    return res.status(200).json({
      success: true,
      message: "Selected address updated successfully",
    });
  } catch (error) {
    console.error("Error setting selected address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set selected address",
      error: error.message,
    });
  }
};
