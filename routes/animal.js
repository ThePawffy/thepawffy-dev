const express = require("express");
const router = express.Router();
const {
  getAnimalData,
  getAllAnimalTypes
} = require("../controllers/animalController");

// ✅ POST: Get species by animalTypeId
router.post("/get-animal-data", getAnimalData);

// ✅ GET: Get all animal types
router.get("/get-animal-types", getAllAnimalTypes);

module.exports = router;
