// controllers/foundPetController.js
const foundPetSchema = require("../models/foundPetModel");
const { db, admin } = require("../config/firebase");

const COLLECTION = "found_pets";

exports.createFoundPet = async (req, res) => {
  try {
    // Validate incoming body
    const { error, value } = foundPetSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map(d => d.message),
      });
    }

    // prepare data
    const dataToSave = {
      ...value,
      // createdAt will be set by Firestore serverTimestamp
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add document (Firestore auto-generated ID)
    const docRef = await db.collection(COLLECTION).add(dataToSave);

    // Fetch the created doc to return createdAt timestamp (serverTimestamp becomes actual value after write)
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data() || {};

    // Build response object including Firestore doc id
    const responseObj = {
      id: docRef.id,
      ...createdData,
    };

    return res.status(201).json({
      status: 201,
      message: "Found pet reported successfully",
      data: responseObj,
    });
  } catch (err) {
    console.error("createFoundPet error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message || err.toString(),
    });
  }
};
