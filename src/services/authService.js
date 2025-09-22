const { auth } = require('../config/firebase');
const logger = require('../utils/logger');

class AuthService {
  // Send OTP using Firebase Phone Auth
  async sendOTP(phoneNumber) {
    try {
      // Generate a mock verification ID for demo purposes
      // In production, this would come from Firebase Client SDK
      const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`📱 OTP send requested for phone: ${phoneNumber}`);
      logger.info(`🔑 Mock verification ID generated: ${verificationId}`);
      logger.info(`ℹ️  Use OTP: 123456 for testing`);
      
      // In a real scenario, Firebase handles OTP sending
      return {
        success: true,
        verificationId,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  // Verify OTP and create Firebase user if needed
  async verifyOTP(phoneNumber, verificationId, otp) {
    try {
      // For demo purposes, accept OTP "123456" as valid
      if (otp !== '123456') {
        throw new Error('Invalid OTP. Use 123456 for testing.');
      }

      logger.info(`✅ OTP verification requested for phone: ${phoneNumber}`);

      // Check if user exists in Firebase Auth
      let firebaseUser;
      try {
        firebaseUser = await auth.getUserByPhoneNumber(phoneNumber);
        logger.info(`👤 Existing Firebase user found: ${firebaseUser.uid}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new Firebase user
          try {
            firebaseUser = await auth.createUser({
              phoneNumber: phoneNumber,
              disabled: false
            });
            logger.info(`🆕 New Firebase user created: ${firebaseUser.uid}`);
          } catch (createError) {
            logger.error('Error creating Firebase user:', createError);
            throw new Error('Failed to create user account');
          }
        } else {
          logger.error('Error checking user existence:', error);
          throw error;
        }
      }

      // Generate custom token for the user
      const customToken = await auth.createCustomToken(firebaseUser.uid);

      return {
        success: true,
        uid: firebaseUser.uid,
        customToken,
        phoneNumber: firebaseUser.phoneNumber,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  // Verify Firebase ID token
  async verifyIdToken(idToken) {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      return {
        success: true,
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
        decodedToken
      };
    } catch (error) {
      logger.error('Error verifying ID token:', error);
      throw new Error('Invalid or expired token');
    }
  }

  // Create custom token
  async createCustomToken(uid) {
    try {
      const customToken = await auth.createCustomToken(uid);
      return customToken;
    } catch (error) {
      logger.error('Error creating custom token:', error);
      throw new Error('Failed to create custom token');
    }
  }
}

module.exports = new AuthService();