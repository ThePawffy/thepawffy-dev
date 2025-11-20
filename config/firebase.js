const admin = require("firebase-admin");

let serviceAccount = null;

if (!admin.apps.length) {
  // Decode Base64 secret stored in Fly.io
  const base64Key = process.env.FIREBASE_KEY_BASE64;

  if (!base64Key) {
    throw new Error("❌ FIREBASE_KEY_BASE64 environment secret is missing!");
  }

  // Convert Base64 → JSON string → Object
  const decodedKey = Buffer.from(base64Key, "base64").toString("utf8");
  serviceAccount = JSON.parse(decodedKey);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
