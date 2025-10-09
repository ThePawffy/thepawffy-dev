const { createLostPetSchema, updateLostPetSchema } = require("../models/lostPetModel");
const { db, admin } = require("../config/firebase");

const COLLECTION = "reports";

// CREATE a lost pet
exports.createLostPet = async (req, res) => {
  try {
    const { error, value } = createLostPetSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        details: error.details.map(d => d.message),
      });
    }

    const docRef = db.collection(COLLECTION).doc();

    const dataToSave = {
      ...value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(dataToSave);
    const createdDoc = await docRef.get();

    return res.status(201).json({
      status: 201,
      message: "Lost pet reported successfully",
      data: { id: docRef.id, ...createdDoc.data() },
    });
  } catch (err) {
    console.error("createLostPet error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// READ all lost pets
exports.getAllLostPets = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      status: 200,
      message: "Lost pets fetched successfully",
      data: pets,
    });
  } catch (err) {
    console.error("getAllLostPets error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// READ one lost pet
exports.getLostPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ status: 404, message: "Lost pet not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Lost pet fetched successfully",
      data: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getLostPetById error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// UPDATE a lost pet
exports.updateLostPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLostPetSchema.validate(req.body, { abortEarly: false });

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
      return res.status(404).json({ status: 404, message: "Lost pet not found" });
    }

    await docRef.update({ ...value, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      status: 200,
      message: "Lost pet updated successfully",
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (err) {
    console.error("updateLostPet error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// DELETE a lost pet
exports.deleteLostPet = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ status: 404, message: "Lost pet not found" });
    }

    await docRef.delete();

    return res.status(200).json({
      status: 200,
      message: "Lost pet deleted successfully",
      id,
    });
  } catch (err) {
    console.error("deleteLostPet error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
