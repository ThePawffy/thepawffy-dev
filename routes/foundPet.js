// routes/foundPet.js
const express = require("express");
const router = express.Router();
const { createFoundPet } = require("../controllers/foundPetController");

// POST /found-pets
router.post("/", createFoundPet);

module.exports = router;
