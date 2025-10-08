const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");

// Combined API for Lost and Found pets
exports.getAllReports = asyncHandler(async (req, res) => {
  try {
    const collectionRef = db.collection("lost_report_pets");
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return res.status(404).json({
        status: false,
        message: "No documents found in lost_report_pets collection",
      });
    }

    const lostPets = [];
    const foundPets = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.typeOfPost === "Lost") {
        lostPets.push({ id: doc.id, ...data });
      } else if (data.typeOfPost === "Found") {
        foundPets.push({ id: doc.id, ...data });
      }
    });

    res.status(200).json({
      status: true,
      total: snapshot.size,
      lostCount: lostPets.length,
      foundCount: foundPets.length,
      lostPets,
      foundPets,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
