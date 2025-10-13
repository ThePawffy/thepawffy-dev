const { db } = require("../config/firebase");

// ✅ Create or Update Pets for a User
exports.createPet = async (req, res) => {
  try {
    const { userId, added_pets } = req.body;
    if (!userId || !added_pets) {
      return res.status(400).json({
        success: false,
        message: "userId and added_pets are required",
      });
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const petsWithIds = Array.isArray(added_pets)
      ? added_pets.map((pet) => ({ ...pet, petId: db.collection("pets").doc().id, createdAt: new Date() }))
      : [{ ...added_pets, petId: db.collection("pets").doc().id, createdAt: new Date() }];

    const petsQuery = await db.collection("pets").where("userId", "==", userId).get();
    let petDocRef;
    let updatedData;

    if (!petsQuery.empty) {
      petDocRef = petsQuery.docs[0].ref;
      const existingData = petsQuery.docs[0].data();
      const existingPetsArray = Array.isArray(existingData.added_pets)
        ? existingData.added_pets
        : existingData.added_pets
        ? [existingData.added_pets]
        : [];

      updatedData = {
        ...existingData,
        added_pets: [...existingPetsArray, ...petsWithIds],
        updatedAt: new Date(),
      };
      await petDocRef.update(updatedData);
    } else {
      const newDocRef = db.collection("pets").doc();
      updatedData = { id: newDocRef.id, userId, added_pets: petsWithIds, createdAt: new Date(), updatedAt: new Date() };
      await newDocRef.set(updatedData);
      petDocRef = newDocRef;
    }

    const { ownerInfo, ...responseData } = updatedData;
    res.status(201).json({ success: true, message: "Pet(s) added successfully", data: { id: petDocRef.id, ...responseData } });
  } catch (error) {
    console.error("❌ Error creating pet:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// ✅ READ PET(S)
exports.getPet = async (req, res) => {
  try {
    const { id, petId } = req.params;

    if (petId) {
      // Fetch single pet by petId inside all documents
      const snapshot = await db.collection("pets").get();
      let foundPet = null;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const petsArray = Array.isArray(data.added_pets) ? data.added_pets : data.added_pets ? [data.added_pets] : [];
        const pet = petsArray.find((p) => p.petId === petId);
        if (pet) foundPet = { ...pet, userId: data.userId, parentDocId: doc.id };
      });

      if (!foundPet) return res.status(404).json({ success: false, message: "Pet not found" });
      return res.status(200).json({ success: true, pet: foundPet });
    }

    if (id) {
      // Fetch all pets in a document
      const docRef = db.collection("pets").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return res.status(404).json({ success: false, message: "Pet not found" });

      const data = docSnap.data();
      const petsArray = Array.isArray(data.added_pets) ? data.added_pets : data.added_pets ? [data.added_pets] : [];
      return res.status(200).json({ success: true, pets: petsArray, userId: data.userId, parentDocId: docSnap.id });
    }

    res.status(400).json({ success: false, message: "Please provide either id or petId in params" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch pet(s)", error: error.message });
  }
};

// ✅ UPDATE PET
exports.updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const updatedData = req.body;

    const snapshot = await db.collection("pets").get();
    let petDocRef = null;
    let petsArray = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const currentPets = Array.isArray(data.added_pets) ? data.added_pets : data.added_pets ? [data.added_pets] : [];
      const petIndex = currentPets.findIndex((p) => p.petId === petId);
      if (petIndex > -1) {
        petDocRef = doc.ref;
        petsArray = currentPets;
        petsArray[petIndex] = { ...petsArray[petIndex], ...updatedData, updatedAt: new Date() };
      }
    });

    if (!petDocRef) return res.status(404).json({ success: false, message: "Pet not found" });

    await petDocRef.update({ added_pets: petsArray });
    res.status(200).json({ success: true, message: "Pet updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update pet", error: error.message });
  }
};

// ✅ DELETE PET
exports.deletePet = async (req, res) => {
  try {
    const { petId } = req.params;

    const snapshot = await db.collection("pets").get();
    let petDocRef = null;
    let updatedPets = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const currentPets = Array.isArray(data.added_pets) ? data.added_pets : data.added_pets ? [data.added_pets] : [];
      if (currentPets.some((p) => p.petId === petId)) {
        petDocRef = doc.ref;
        updatedPets = currentPets.filter((p) => p.petId !== petId);
      }
    });

    if (!petDocRef) return res.status(404).json({ success: false, message: "Pet not found" });

    await petDocRef.update({ added_pets: updatedPets });
    res.status(200).json({ success: true, message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete pet", error: error.message });
  }
};
