const functions = require('firebase-functions');
const app = require('../src/app');

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);

// Additional Cloud Functions can be added here
// For example, database triggers, storage triggers, etc.

// Example: User creation trigger
exports.onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    const newUser = snap.data();
    const userId = context.params.userId;
    
    console.log('New user created:', userId, newUser);
    
    // You can add additional logic here:
    // - Send welcome email
    // - Create default settings
    // - Initialize user-specific collections
    
    return null;
  });

// Example: User update trigger
exports.onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const userId = context.params.userId;
    
    console.log('User updated:', userId);
    
    // You can add logic for:
    // - Profile completion notifications
    // - Data validation
    // - Audit logs
    
    return null;
  });

// Example: Send notification when terms are accepted
exports.onTermsAccepted = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Check if terms were just accepted
    if (!beforeData.termsConfirmation?.accepted && afterData.termsConfirmation?.accepted) {
      console.log('Terms accepted for user:', context.params.userId);
      
      // Send welcome notification or email
      // You can integrate with FCM here
    }
    
    return null;
  });