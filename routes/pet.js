const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");

// CREATE or UPDATE PET(S)
router.post("/", petController.createPet);

// READ ALL PETS
router.get("/", petController.getAllPets);

// READ PET BY DOCUMENT ID
router.get("/doc/:id", petController.getPet);

// READ SINGLE PET BY PET ID
router.get("/pet/:petId", petController.getPet);

// UPDATE PET BY PET ID
router.put("/:petId", petController.updatePet);

// DELETE PET BY PET ID
router.delete("/:petId", petController.deletePet);

module.exports = router;
