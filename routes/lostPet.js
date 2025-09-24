const express = require("express");
const router = express.Router();
const {
  createLostPetReport,
  getLostPetReports,
  getLostPetReportById,
} = require("../controllers/lostPetController");

// POST new lost pet report
router.post("/report", createLostPetReport);

// GET all lost pet reports
router.get("/reports", getLostPetReports);

// GET a single lost pet report by ID
router.get("/report/:id", getLostPetReportById);

module.exports = router;
