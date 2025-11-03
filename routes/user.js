const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// ----------------------
// EXISTING ROUTES
// ----------------------
router.get("/check-user-exists/:doc_id", userController.checkUser);
router.post("/upsert", userController.upsertUser);
router.post("/get-addresses", userController.getUserAddress);

// ----------------------
// CRUD ADDRESS ROUTES
// ----------------------
router.post("/add-address", userController.addAddress);             // Add new address
router.put("/update-address", userController.updateAddress);        // Update existing address
router.post("/delete-address", userController.deleteAddress);     // Delete addresss
router.post("/set-selected-address", userController.setSelectedAddress);  // Set selected address

module.exports = router;