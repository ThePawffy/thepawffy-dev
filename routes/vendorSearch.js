const express = require("express");
const router = express.Router();
const { searchVendors } = require("../controllers/vendorSearchController");

// ✅ POST: Search vendors nearby
router.post("/search-vendors", searchVendors);

module.exports = router;
