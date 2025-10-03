// controllers/dashboardController.js
const { db } = require("../config/firebase");
const { getRandomPetCareQuote } = require("../utils/quote");

// Utility function to calculate distance using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Dashboard API (all in one)
exports.dashboard = async (req, res) => {
  try {
    const { userId, latitude, longitude, id } = req.body;
    const response = {};

    // 1. Get user by ID
    if (userId) {
      const userDoc = await db.collection("users").doc(userId).get();
      response.user = userDoc.exists ? userDoc.data() : null;
    }

    // 2. Get partners within 25 km
    if (latitude && longitude) {
      const usersSnap = await db.collection("users").where("role", "==", "partner").get();
      const partnersNearby = [];
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          const distance = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            data.latitude,
            data.longitude
          );
          if (distance <= 25) {
            partnersNearby.push({ id: doc.id, ...data, distance });
          }
        }
      });
      response.partnersNearby = partnersNearby;
    }

    // 3. Notifications by userId
    exports.getNotificationMessagesByUserId = async (req, res) => {
      try {
        const { userId } = req.body; // expecting in body
        if (!userId) {
          return res.status(400).json({ error: "userId is required" });
        }

        const snap = await db.collection("notifications").get();

        const messages = [];
        snap.forEach((doc) => {
          const data = doc.data();
          if (data.senderId === userId || data.receiverId === userId) {
            if (data.notificationMessage) {
              messages.push({ id: doc.id, notificationMessage: data.notificationMessage });
            }
          }
        });

        res.json(messages);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };

    // 4. Active categories
    const categoriesSnap = await db.collection("categories").where("status", "==", true).get();
    const categories = [];
    categoriesSnap.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
    response.categories = categories;

    // ✅ 5. Add random pet care quote
    response.quote = getRandomPetCareQuote();

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Separate APIs
exports.getUserById = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    res.json(doc.exists ? doc.data() : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPartnersNearby = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const usersSnap = await db.collection("users").where("role", "==", "partner").get();
    const partnersNearby = [];
    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.latitude && data.longitude) {
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          data.latitude,
          data.longitude
        );
        if (distance <= 25) {
          partnersNearby.push({ id: doc.id, ...data, distance });
        }
      }
    });
    res.json(partnersNearby);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationsById = async (req, res) => {
  try {
    const id = req.params.id;
    const snap = await db.collection("notifications").get();
    const notifications = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.senderId === id || data.receiverId === id) {
        notifications.push({ id: doc.id, ...data });
      }
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveCategories = async (req, res) => {
  try {
    const snap = await db.collection("categories").where("status", "==", true).get();
    const categories = [];
    snap.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
