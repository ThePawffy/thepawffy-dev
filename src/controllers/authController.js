const authService = require('../services/authService');
const userService = require('../services/userService');
const { sendSuccess, sendError, sanitizeUserData } = require('../utils');
const logger = require('../utils/logger');

class AuthController {
  // Send OTP
  async sendOTP(req, res) {
    try {
      const { phoneNumber } = req.body;
      
      logger.info(`OTP request for phone: ${phoneNumber}`);
      
      const result = await authService.sendOTP(phoneNumber);
      
      return sendSuccess(res, result.message, {
        verificationId: result.verificationId
      });
    } catch (error) {
      logger.error('Send OTP error:', error);
      return sendError(res, 500, error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
    try {
      const { phoneNumber, verificationId, otp } = req.body;
      
      logger.info(`OTP verification for phone: ${phoneNumber}`);
      
      // Verify OTP with Firebase
      const authResult = await authService.verifyOTP(phoneNumber, verificationId, otp);
      
      if (!authResult.success) {
        return sendError(res, 400, 'Invalid OTP');
      }

      // Check if user exists in Firestore
      let user = await userService.getUserByPhoneNumber(phoneNumber);
      
      if (user) {
        // Existing user - direct login
        logger.info(`Existing user login: ${user.id}`);
        
        // Check if registration is complete
        const isComplete = userService.isRegistrationComplete(user);
        
        return sendSuccess(res, 'Login successful! Redirecting to Home Screen.', {
          user: sanitizeUserData(user),
          customToken: authResult.customToken,
          isRegistrationComplete: isComplete,
          redirectTo: 'HOME_SCREEN'
        });
      } else {
        // New user - create dummy record
        logger.info(`Creating new user for phone: ${phoneNumber}`);
        
        const dummyUser = await userService.createDummyUser(phoneNumber, authResult.uid);
        
        return sendSuccess(res, 'OTP Verified. Please complete registration.', {
          user: sanitizeUserData(dummyUser),
          customToken: authResult.customToken,
          isRegistrationComplete: false,
          redirectTo: 'COMPLETE_PROFILE_SCREEN'
        });
      }
    } catch (error) {
      logger.error('Verify OTP error:', error);
      return sendError(res, 400, error.message || 'Failed to verify OTP');
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { uid } = req.user; // From auth middleware
      
      const customToken = await authService.createCustomToken(uid);
      
      return sendSuccess(res, 'Token refreshed successfully', {
        customToken
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      return sendError(res, 500, 'Failed to refresh token');
    }
  }

  // Logout (optional - mainly handled on client side)
  async logout(req, res) {
    try {
      // In Firebase, logout is typically handled on client side
      // Server can revoke tokens if needed
      
      return sendSuccess(res, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      return sendError(res, 500, 'Failed to logout');
    }
  }
}

module.exports = new AuthController();