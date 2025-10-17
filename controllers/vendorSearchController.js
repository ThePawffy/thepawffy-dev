const { db } = require("../config/firebase");

// 🔹 Helper function to calculate distance in km using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

exports.searchVendors = async (req, res) => {
  try {
    const { searching_for, latitude, longitude } = req.body;

    // ✅ Validate inputs
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

    // ✅ Fetch all users with role 'vendor'
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("role", "==", "vendor").get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No vendors found",
      });
    }

    const nearbyVendors = [];

    // ✅ Iterate vendors and apply matching logic
    snapshot.forEach((doc) => {
      const vendor = doc.data();

      if (
        vendor.vendorType === searching_for &&
        vendor.zoneCenter &&
        vendor.zoneCenter.latitude &&
        vendor.zoneCenter.longitude
      ) {
        const vendorLat = vendor.zoneCenter.latitude;
        const vendorLon = vendor.zoneCenter.longitude;

        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          vendorLat,
          vendorLon
        );

        // ✅ Include vendor if within 25 km
        if (distance <= 25) {
          nearbyVendors.push({
            id: doc.id,
            distance_km: parseFloat(distance.toFixed(2)),
            ...vendor, // return complete vendor document
          });
        }
      }
    });

    // ✅ Return result
    return res.status(200).json({
      success: true,
      count: nearbyVendors.length,
      vendors: nearbyVendors,
    });
  } catch (error) {
    console.error("Error searching vendors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
