const admin = require("firebase-admin");

if (!admin.apps.length) {
  const base64Key = process.env.FIREBASE_KEY_BASE64;

  if (!base64Key) throw new Error("Missing Firebase KEY");

  const serviceAccountJSON = Buffer.from(base64Key, "base64").toString("utf8");

  const serviceAccount = JSON.parse(serviceAccountJSON);

  // Fix key formatting
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
}

const db = admin.firestore();

module.exports = { admin, db };
