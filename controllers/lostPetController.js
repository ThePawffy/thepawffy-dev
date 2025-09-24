const { db } = require("../config/firebase");
const { lostPetSchema } = require("../models/lostPetModel");

// ✅ CREATE Lost Pet Report
exports.createLostPetReport = async (req, res, next) => {
  try {
    const { error, value } = lostPetSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        details: error.details.map(err => err.message),
      });
    }

    if (!value.createdAt) {
      value.createdAt = new Date().toISOString();
    }

    const docRef = await db.collection("lost_report_pets").add(value);

    res.status(201).json({
      message: "Lost pet report created successfully",
      docId: docRef.id,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ READ All Reports
exports.getLostPetReports = async (req, res, next) => {
  try {
    const snapshot = await db.collection("lost_report_pets").get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(reports);
  } catch (err) {
    next(err);
  }
};

// ✅ READ One Report
exports.getLostPetReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("lost_report_pets").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Lost pet report not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE Report
exports.updateLostPetReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate payload
    const { error, value } = lostPetSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        details: error.details.map(err => err.message),
      });
    }

    const docRef = db.collection("lost_report_pets").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Lost pet report not found" });
    }

    await docRef.update(value);

    res.status(200).json({
      message: "Lost pet report updated successfully",
      id,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE Report
exports.deleteLostPetReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("lost_report_pets").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Lost pet report not found" });
    }

    await docRef.delete();

    res.status(200).json({ message: "Lost pet report deleted successfully", id });
  } catch (err) {
    next(err);
  }
};
