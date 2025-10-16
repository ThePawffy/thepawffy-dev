const { db } = require("../config/firebase");

// GET animal data based on type
exports.getAnimalData = async (req, res) => {
  try {
    const { animalTypeId } = req.body;

    if (!animalTypeId) {
      return res.status(400).json({ error: "animalTypeId is required" });
    }

    // Fetch all animal_species matching the given animalTypeId
    const speciesSnapshot = await db
      .collection("animal_species")
      .where("animalTypeId", "==", animalTypeId)
      .get();

    const matchedSpecies = speciesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch full animal_type collection
    const typeSnapshot = await db.collection("animal_type").get();
    const allAnimalTypes = typeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      animalTypeId,
      matchedSpecies,
      allAnimalTypes,
    });
  } catch (error) {
    console.error("Error fetching animal data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
