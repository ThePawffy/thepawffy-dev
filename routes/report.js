const express = require("express");
const router = express.Router();
const { getAllReports } = require("../controllers/reportController");

router.get("/all-reports", getAllReports);

module.exports = router;
