const { db } = require("../config/firebase");

// Controller to create lost pet report
exports.createLostPetReport = async (req, res, next) => {
  try {
    const data = req.body;

    // Add createdAt if not provided
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }

    // Store in Firestore with auto-ID
    const docRef = await db.collection("lost_report_pets").add(data);

    res.status(201).json({
      message: "Lost pet report created successfully",
      docId: docRef.id,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to fetch all lost pet reports
exports.getLostPetReports = async (req, res, next) => {
  try {
    const snapshot = await db.collection("lost_report_pets").get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// Controller to fetch single report by ID
exports.getLostPetReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("lost_report_pets").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Lost pet report not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
};
