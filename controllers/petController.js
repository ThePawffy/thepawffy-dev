// controllers/petController.js
const { db } = require("../config/firebase");
const petModel = require("../models/petModel");

exports.createPet = async (req, res) => {
  try {
    const { userId, added_pets } = req.body;

    if (!userId || !added_pets) {
      return res.status(400).json({ success: false, message: "userId and added_pets required" });
    }

    // Check if user exists in "users" collection
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Combine user data with pet data
    const userData = userSnap.data();
    const petData = {
      userId,
      added_pets,
      ownerInfo: {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newPet = await petModel.createPet(petData);

    res.status(201).json({
      success: true,
      message: "Pet added successfully",
      data: newPet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.getAllPets = async (req, res) => {
  try {
    const pets = await petModel.getAllPets();
    res.status(200).json({ success: true, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petModel.getPetById(id);
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const pet = await petModel.updatePet(id, updatedData);
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await petModel.deletePet(id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
