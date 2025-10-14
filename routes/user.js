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
router.delete("/delete-address", userController.deleteAddress);     // Delete address
router.post("/set-select-address", userController.setSelectedAddress);  // Set selected address

module.exports = router;
