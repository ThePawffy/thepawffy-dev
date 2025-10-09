const { db } = require("../config/firebase");
const { lostPetSchema } = require("../models/lostPetModel");

// ✅ CREATE Lost Pet Report
exports.createLostPetReport = async (req, res, next) => {
  try {
    const { error, value } = lostPetSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        details: error.details.map(err => err.message),
      });
    }

    // Add creation timestamp
    value.createdAt = value.createdAt || new Date().toISOString();

    // Add to Firestore
    const docRef = await db.collection("reports").add(value);

    // Fetch saved document data
    const createdDoc = await docRef.get();
    const data = { id: docRef.id, ...createdDoc.data() };

    res.status(201).json({
      success: true,
      message: "Lost pet report created successfully",
      data,
    });
  } catch (err) {
    console.error("Error creating lost pet report:", err);
    next(err);
  }
};

// ✅ READ All Lost Pet Reports
exports.getLostPetReports = async (req, res, next) => {
  try {
    const snapshot = await db.collection("reports").get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching lost pet reports:", err);
    next(err);
  }
};

// ✅ READ One Lost Pet Report by ID
exports.getLostPetReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("reports").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Lost pet report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching lost pet report:", err);
    next(err);
  }
};

// ✅ UPDATE Lost Pet Report
exports.updateLostPetReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = lostPetSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        details: error.details.map(err => err.message),
      });
    }

    const docRef = db.collection("reports").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Lost pet report not found",
      });
    }

    await docRef.update(value);
    const updatedDoc = await docRef.get();

    res.status(200).json({
      success: true,
      message: "Lost pet report updated successfully",
      data: { id: docRef.id, ...updatedDoc.data() },
    });
  } catch (err) {
    console.error("Error updating lost pet report:", err);
    next(err);
  }
};

// ✅ DELETE Lost Pet Report
exports.deleteLostPetReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("reports").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Lost pet report not found",
      });
    }

    const deletedData = { id: doc.id, ...doc.data() };
    await docRef.delete();

    res.status(200).json({
      success: true,
      message: "Lost pet report deleted successfully",
      data: deletedData, // ✅ return deleted data
    });
  } catch (err) {
    console.error("Error deleting lost pet report:", err);
    next(err);
  }
};
