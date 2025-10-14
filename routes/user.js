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
router.post("/address/add", userController.addAddress);             // Add new address
router.put("/address/update", userController.updateAddress);        // Update existing address
router.delete("/address/delete", userController.deleteAddress);     // Delete address
router.post("/address/select", userController.setSelectedAddress);  // Set selected address

module.exports = router;
