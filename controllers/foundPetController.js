// controllers/foundPetController.js
const { createFoundPetSchema, updateFoundPetSchema } = require("../models/foundPetModel");
const { db, admin } = require("../config/firebase");

const COLLECTION = "found_pets";

// CREATE a found pet
exports.createFoundPet = async (req, res) => {
  try {
    const { error, value } = createFoundPetSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map(d => d.message),
      });
    }

    // Create new document reference
    const docRef = db.collection(COLLECTION).doc();

    const dataToSave = {
      ...value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    await docRef.set(dataToSave);

    // Fetch the created document
    const createdDoc = await docRef.get();

    return res.status(201).json({
      status: 201,
      message: "Found pet reported successfully",
      data: {
        id: docRef.id,
        ...createdDoc.data(),
      },
    });
  } catch (err) {
    console.error("createFoundPet error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};



// READ all found pets
exports.getAllFoundPets = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      status: 200,
      message: "Found pets fetched successfully",
      data: pets,
    });
  } catch (err) {
    console.error("getAllFoundPets error:", err);
    return res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
  }
};

// READ one found pet by ID
exports.getFoundPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ status: 404, message: "Found pet not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Found pet fetched successfully",
      data: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getFoundPetById error:", err);
    return res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
  }
};

// UPDATE a found pet
exports.updateFoundPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateFoundPetSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map(d => d.message),
      });
    }

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ status: 404, message: "Found pet not found" });
    }

    await docRef.update({ ...value, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    const updatedDoc = await docRef.get();

    return res.status(200).json({
      status: 200,
      message: "Found pet updated successfully",
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (err) {
    console.error("updateFoundPet error:", err);
    return res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
  }
};

// DELETE a found pet
exports.deleteFoundPet = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ status: 404, message: "Found pet not found" });
    }

    await docRef.delete();

    return res.status(200).json({
      status: 200,
      message: "Found pet deleted successfully",
      id,
    });
  } catch (err) {
    console.error("deleteFoundPet error:", err);
    return res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
  }
};
