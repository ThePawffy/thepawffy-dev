// routes/pet.js
const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");

// CREATE
router.post("/", petController.createPet);

// READ
router.get("/", petController.getAllPets);
router.get("/:id", petController.getPetById);

// UPDATE
router.put("/:id", petController.updatePet);

// DELETE
router.delete("/:id", petController.deletePet);

module.exports = router;
