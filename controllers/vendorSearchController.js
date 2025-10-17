const { db } = require("../config/firebase");

// ------------------------------
// Helper: Calculate distance (Haversine Formula)
// ------------------------------
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
  return R * c;
}

// ------------------------------
// Fetch all vendors by role
// ------------------------------
async function fetchVendorsByRole() {
  console.log("📥 Fetching all vendors...");
  const snapshot = await db.collection("users").where("role", "==", "vendor").get();

  if (snapshot.empty) {
    console.log("⚠ No vendors found in Firestore!");
    return [];
  }

  const vendors = [];
  snapshot.forEach((doc) => {
    const vendor = doc.data();
    vendor.id = doc.id;
    vendors.push(vendor);
  });

  console.log(`✅ Found ${vendors.length} vendor documents`);
  return vendors;
}

// ------------------------------
// Filter vendors by vendorType
// ------------------------------
function filterByVendorType(vendors, searchingFor) {
  const filtered = [];
  vendors.forEach((vendor) => {
    if (!Array.isArray(vendor.serviceDetails)) return;

    vendor.serviceDetails.forEach((service) => {
      const vendorType = service.vendorType?.toLowerCase() || "";
      if (vendorType === searchingFor.toLowerCase()) {
        console.log(`✅ Matched '${vendorType}' for vendor ${vendor.id}`);
        filtered.push({ ...vendor, matchedService: service });
      }
    });
  });

  console.log(`📊 ${filtered.length} vendors matched type '${searchingFor}'`);
  return filtered;
}

// ------------------------------
// Filter vendors within distance
// ------------------------------
function filterByDistance(vendors, userLat, userLon, maxDistanceKm = 25) {
  const nearby = [];

  vendors.forEach((vendor) => {
    const zoneCenter = vendor.matchedService?.zoneCenter;
    if (!zoneCenter || !zoneCenter.latitude || !zoneCenter.longitude) return;

    const distance = getDistanceFromLatLonInKm(
      userLat,
      userLon,
      parseFloat(zoneCenter.latitude),
      parseFloat(zoneCenter.longitude)
    );

    console.log(`📍 Vendor ${vendor.id}: ${distance.toFixed(2)} km`);

    if (distance <= maxDistanceKm) {
      nearby.push({
        id: vendor.id,
        name: vendor.name || "",
        description: vendor.description || "",
        profileImage: vendor.profileImage || "",
        distance_km: parseFloat(distance.toFixed(2)),
      });
    }
  });

  console.log(`📊 ${nearby.length} vendors within ${maxDistanceKm} km`);
  return nearby;
}

// ------------------------------
// ✅ API 1: Get Nearby Vendors
// ------------------------------
exports.getNearbyVendors = async (req, res) => {
  try {
    const { searching_for, latitude, longitude } = req.body;

    if (!searching_for || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: searching_for, latitude, longitude",
      });
    }

    console.log("\n🔎 Searching Nearby Vendors...");
    console.log(`📍 Searching for: ${searching_for}`);
    console.log(`🧭 User Location: (${latitude}, ${longitude})`);

    const vendors = await fetchVendorsByRole();
    const matchedVendors = filterByVendorType(vendors, searching_for);
    const nearbyVendors = filterByDistance(
      matchedVendors,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    nearbyVendors.sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      count: nearbyVendors.length,
      vendors: nearbyVendors,
    });
  } catch (error) {
    console.error("❌ Error in getNearbyVendors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ------------------------------
// ✅ API 2: Get Vendor Service Details by Type
// ------------------------------
exports.getVendorServiceDetails = async (req, res) => {
  try {
    const { id, vendorType } = req.body;

    if (!id || !vendorType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id, vendorType",
      });
    }

    console.log(`\n📄 Fetching vendor details for ID: ${id}, Type: ${vendorType}`);

    const docRef = db.collection("users").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log("❌ Vendor not found!");
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const vendor = docSnap.data();
    if (!Array.isArray(vendor.serviceDetails)) {
      return res.status(404).json({ success: false, message: "No services found" });
    }

    const matchedServices = vendor.serviceDetails.filter(
      (s) => s.vendorType?.toLowerCase() === vendorType.toLowerCase()
    );

    if (matchedServices.length === 0) {
      console.log("⚠ No matching service type found!");
      return res.status(404).json({ success: false, message: "No matching services found" });
    }

    const results = matchedServices.map((service) => ({
      id,
      name: vendor.name || "",
      des: vendor.description || "",
      profileImage: vendor.profileImage || "",
      serviceImages: service.serviceImages || [],
      services: service.groomerRoleService || {},
      packages: service.packageService || [],
      serviceAddress: service.serviceAddress || "",
    }));

    console.log(`✅ Found ${results.length} services for ${vendorType}`);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("❌ Error in getVendorServiceDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
