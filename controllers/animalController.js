const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");

// ✅ API #1: Get species by animalTypeId and full animal_type list
exports.getAnimalData = asyncHandler(async (req, res) => {
  const { animalTypeId } = req.body;

  if (!animalTypeId) {
    return res.status(400).json({ success: false, message: "animalTypeId is required" });
  }

  // 🔹 Fetch species that match animalTypeId
  const speciesSnapshot = await db
    .collection("animal_species")
    .where("animalTypeId", "==", animalTypeId)
    .get();

  const matchedSpecies = speciesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 🔹 Fetch all animal types
  const typeSnapshot = await db.collection("animal_type").get();
  const allAnimalTypes = typeSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    animalTypeId,
    matchedSpecies,
    allAnimalTypes,
  });
});

// ✅ API #2: Get all animal types
exports.getAllAnimalTypes = asyncHandler(async (req, res) => {
  const typeSnapshot = await db.collection("animal_type").get();

  if (typeSnapshot.empty) {
    return res.status(404).json({ success: false, message: "No animal types found" });
  }

  const allAnimalTypes = typeSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    count: allAnimalTypes.length,
    allAnimalTypes,
  });
});
