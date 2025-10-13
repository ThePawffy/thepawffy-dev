// controllers/petController.js
const { db } = require("../config/firebase");

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

    // Check if a document already exists in "pets" for this user
    const petsQuery = await db.collection("pets").where("userId", "==", userId).get();

    // Assign unique IDs to each pet
    const petsWithIds = Array.isArray(added_pets)
      ? added_pets.map((pet) => ({
          ...pet,
          petId: db.collection("pets").doc().id,
          createdAt: new Date(),
        }))
      : [
          {
            ...added_pets,
            petId: db.collection("pets").doc().id,
            createdAt: new Date(),
          },
        ];

    let petDocRef;
    let updatedData;

    if (!petsQuery.empty) {
      // If user already has a document, append new pets
      petDocRef = petsQuery.docs[0].ref;
      const existingData = petsQuery.docs[0].data();

      updatedData = {
        ...existingData,
        added_pets: [...(existingData.added_pets || []), ...petsWithIds],
        updatedAt: new Date(),
      };

      await petDocRef.update(updatedData);
    } else {
      // Otherwise, create a new document for this user
      const newDocRef = db.collection("pets").doc();
      updatedData = {
        id: newDocRef.id,
        userId,
        added_pets: petsWithIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await newDocRef.set(updatedData);
      petDocRef = newDocRef;
    }

    res.status(201).json({
      success: true,
      message: "Pet(s) added successfully",
      data: { id: petDocRef.id, ...updatedData },
    });
  } catch (error) {
    console.error("Error creating pet:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
