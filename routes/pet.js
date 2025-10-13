const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");

// CREATE PET(S) for a user
router.post("/", petController.createPet);

// READ ALL PETS
router.get("/", petController.getAllPets);

// READ PET(S)
// By parent document ID: /api/pets/doc/:id
router.get("/doc/:id", petController.getPet);

// By single pet ID: /api/pets/pet/:petId
router.get("/pet/:petId", petController.getPet);

// UPDATE PET
// Update single pet by petId
router.put("/pet/:petId", petController.updatePet);

// DELETE PET
// Delete single pet by petId
router.delete("/pet/:petId", petController.deletePet);

module.exports = router;
