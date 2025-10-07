// controllers/dashboardController.js
const { db } = require("../config/firebase");
const { getRandomPetCareQuote } = require("../utils/quotes");

// Utility function: calculate distance (Haversine)
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

// ✅ Combined Dashboard API
exports.dashboard = async (req, res) => {
  try {
    const { userId, latitude, longitude, platform } = req.body; // 👈 Added platform param
    const response = {};

    // 1️⃣ Get user by ID
    if (userId) {
      const userDoc = await db.collection("users").doc(userId).get();
      response.user = userDoc.exists ? userDoc.data() : null;
    }

    // 2️⃣ Get partners within 25 km
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

    // 3️⃣ Notifications by userId
    if (userId) {
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
      response.notifications = messages;
    }

    // 4️⃣ Active categories
    const categoriesSnap = await db.collection("categories").where("status", "==", true).get();
    const categories = [];
    categoriesSnap.forEach((doc) => categories.push({ id: doc.id, ...doc.data() }));
    response.categories = categories;

    // 5️⃣ Add banner data (check for app/web)
    if (platform) {
      const bannerDocId =
        platform.toLowerCase() === "web"
          ? "KhiXv3IDx4u7mnL3RSeE"
          : platform.toLowerCase() === "app"
          ? "P0uyKC5H4G2erc2JiNeW"
          : null;

      if (bannerDocId) {
        const bannerDoc = await db.collection("banner").doc(bannerDocId).get();
        response.banner = bannerDoc.exists ? bannerDoc.data() : null;
      } else {
        response.banner = null;
      }
    } else {
      response.banner = null;
    }

    // 6️⃣ Add random pet care quote
    response.quote = getRandomPetCareQuote();

    res.status(200).json(response);
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Separate APIs
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
