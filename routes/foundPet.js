// routes/foundPet.js
const express = require("express");
const router = express.Router();
const {
  createFoundPet,
  getAllFoundPets,
  getFoundPetById,
  updateFoundPet,
  deleteFoundPet
} = require("../controllers/foundPetController");

// CREATE
router.post("/", createFoundPet);

// READ all
router.get("/", getAllFoundPets);

// READ one
router.get("/:id", getFoundPetById);

// UPDATE
router.put("/:id", updateFoundPet);

// DELETE
router.delete("/:id", deleteFoundPet);

module.exports = router;
