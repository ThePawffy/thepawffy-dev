const express = require("express");
const router = express.Router();
const {
  createLostPetReport,
  getLostPetReports,
  getLostPetReportById,
  updateLostPetReport,
  deleteLostPetReport,
} = require("../controllers/lostPetController");

// CREATE
router.post("/report", createLostPetReport);

// READ
router.get("/reports", getLostPetReports);
router.get("/report/:id", getLostPetReportById);

// UPDATE
router.put("/report/:id", updateLostPetReport);

// DELETE
router.delete("/report/:id", deleteLostPetReport);

module.exports = router;
