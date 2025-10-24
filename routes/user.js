const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// ----------------------
// CLERK AUTH ROUTES
// ----------------------
router.post("/send-otp", userController.sendOtp);       // Send OTP via Clerk
router.post("/verify-otp", userController.verifyOtp);   // Verify OTP & return session

// ----------------------
// EXISTING USER ROUTES
// ----------------------
router.get("/check-user-exists/:doc_id", userController.checkUser);
router.post("/upsert", userController.upsertUser);
router.post("/get-addresses", userController.getUserAddress);

// ----------------------
// CRUD ADDRESS ROUTES
// ----------------------
router.post("/add-address", userController.addAddress);             // Add new address
router.put("/update-address", userController.updateAddress);        // Update existing address
router.post("/delete-address", userController.deleteAddress);       // Delete address
router.post("/set-selected-address", userController.setSelectedAddress);  // Set selected address

module.exports = router;
