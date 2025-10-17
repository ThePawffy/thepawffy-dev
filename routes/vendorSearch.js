const express = require("express");
const router = express.Router();
const {
  getNearbyVendors,
  getVendorServiceDetails,
} = require("../controllers/vendorSearchController");

// ✅ POST: Get vendors nearby based on location & type
router.post("/nearby", getNearbyVendors);

// ✅ POST: Get vendor service details by vendorType
router.post("/details", getVendorServiceDetails);

module.exports = router;
