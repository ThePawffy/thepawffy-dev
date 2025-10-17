const { db } = require("../config/firebase");

// ✅ Utility: Calculate distance in km (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 🔹 API: POST /api/search-vendors
 * Body:
 * {
 *   "searching_for": "walking",
 *   "latitude": 28.690624136439634,
 *   "longitude": 77.47897486314933
 * }
 */
exports.searchVendors = async (req, res) => {
  try {
    const { searching_for, latitude, longitude } = req.body;

    // ✅ 1️⃣ Validate input
    if (
      !searching_for ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: searching_for, latitude, longitude",
      });
    }

    const searchType = searching_for.trim().toLowerCase();
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // ✅ 2️⃣ Fetch vendors from Firestore
    const snapshot = await db
      .collection("users")
      .where("role", "==", "vendor")
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        count: 0,
        vendors: [],
        message: "No vendors found in database",
      });
    }

    const nearbyVendors = [];

    // ✅ 3️⃣ Iterate vendors
    snapshot.forEach((doc) => {
      const vendor = doc.data();

      // Only match vendors of the requested service type
      if (
        vendor.vendorType &&
        vendor.vendorType.toLowerCase() === searchType
      ) {
        const zoneCenter = vendor.zoneCenter;
        if (
          zoneCenter &&
          zoneCenter.latitude &&
          zoneCenter.longitude
        ) {
          const vendorLat = parseFloat(zoneCenter.latitude);
          const vendorLon = parseFloat(zoneCenter.longitude);

          // ✅ 4️⃣ Compute distance (user <-> vendor zoneCenter)
          const distance = getDistanceFromLatLonInKm(
            userLat,
            userLon,
            vendorLat,
            vendorLon
          );

          // ✅ 5️⃣ Include vendors within 25 km
          if (distance <= 25) {
            nearbyVendors.push({
              id: doc.id,
              distance_km: parseFloat(distance.toFixed(2)),
              ...vendor,
            });
          }
        }
      }
    });

    // ✅ 6️⃣ Sort by distance (optional)
    nearbyVendors.sort((a, b) => a.distance_km - b.distance_km);

    // ✅ 7️⃣ Response
    return res.status(200).json({
      success: true,
      count: nearbyVendors.length,
      vendors: nearbyVendors,
    });
  } catch (error) {
    console.error("❌ Error in searchVendors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
