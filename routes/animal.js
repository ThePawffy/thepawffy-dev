const express = require("express");
const router = express.Router();
const { getAnimalData } = require("../controllers/animalController");

router.post("/get-animal-data", getAnimalData);

module.exports = router;
