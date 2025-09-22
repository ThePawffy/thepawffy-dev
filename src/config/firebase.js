const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

console.log('🔧 Initializing Firebase Admin SDK...');
console.log('📍 NODE_ENV:', process.env.NODE_ENV);
console.log('📍 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  try {
    let credential;
    let projectId = process.env.FIREBASE_PROJECT_ID;

    // Method 1: Try service account key file
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('📁 Found service account key file');
      const serviceAccount = require(serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
      projectId = serviceAccount.project_id;
      console.log('✅ Using service account key file');
    } 
    // Method 2: Try environment variables
    else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔐 Using environment variables for credentials');
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_id: "108558830936426988120",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
      };
      
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ Using environment variables');
    } 
    // Method 3: Default credentials (production)
    else if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Using default credentials for production');
      credential = admin.credential.applicationDefault();
    } 
    // No credentials found
    else {
      throw new Error('No Firebase credentials found');
    }

    // Initialize Firebase
    admin.initializeApp({
      credential: credential,
      projectId: projectId
    });

    console.log('🚀 Firebase Admin SDK initialized successfully');
    console.log('📋 Project ID:', projectId);
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    // Detailed error guidance
    console.error(`
🔧 FIREBASE SETUP REQUIRED:

Current working directory: ${process.cwd()}
Service account path: ${path.join(__dirname, 'serviceAccountKey.json')}

Option 1 - Create Service Account File:
1. Go to: https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT'}/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the JSON file as: src/config/serviceAccountKey.json

Option 2 - Use Environment Variables:
Make sure your .env file has:
FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID || 'your-project-id'}
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

Current environment variables:
- FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}
- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing'}  
- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✓ Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '✗ Missing'}
    `);
    
    // Don't exit in development, but log error
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️  Server will start but Firebase features will not work');
    } else {
      process.exit(1);
    }
  }
}

// Export Firebase services
let db, auth;

try {
  db = admin.firestore();
  auth = admin.auth();
  console.log('✅ Firestore and Auth services initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase services:', error.message);
  // Create dummy services for development
  db = null;
  auth = null;
}

module.exports = {
  admin,
  db,
  auth
};