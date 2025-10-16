const { db } = require("../config/firebase");
const asyncHandler = require("../middleware/asyncHandler");

// Utility: Calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
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
  return R * c;
}

// ✅ POST: Search vendors nearby
exports.searchVendors = asyncHandler(async (req, res) => {
  const { searching_for, latitude, longitude } = req.body;

  if (!searching_for || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "searching_for, latitude, and longitude are required",
    });
  }

  // 🔹 Fetch users where role == vendor
  const vendorsSnapshot = await db.collection("users").where("role", "==", "vendor").get();

  if (vendorsSnapshot.empty) {
    return res.status(404).json({ success: false, message: "No vendors found" });
  }

  const nearbyVendors = [];

  vendorsSnapshot.forEach((doc) => {
    const vendor = doc.data();

    // Check if vendorType matches searching_for
    if (vendor.vendorType && vendor.vendorType.toLowerCase() === searching_for.toLowerCase()) {
      const vendorLat = vendor.latitude;
      const vendorLon = vendor.longitude;

      if (vendorLat && vendorLon) {
        const distance = calculateDistance(latitude, longitude, vendorLat, vendorLon);
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

  if (nearbyVendors.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No ${searching_for} vendors found within 25 km radius`,
    });
  }

  res.status(200).json({
    success: true,
    count: nearbyVendors.length,
    vendors: nearbyVendors,
  });
});
