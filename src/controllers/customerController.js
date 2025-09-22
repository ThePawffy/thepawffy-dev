const userService = require('../services/userService');
const { sendSuccess, sendError, sanitizeUserData } = require('../utils');
const logger = require('../utils/logger');

class CustomerController {
  // Complete customer registration
  async register(req, res) {
    try {
      const { userId, name, description, profileImage, location, termsConfirmation, addresses } = req.body;
      
      logger.info(`Registration request for user: ${userId}`);
      
      // Validate that user exists
      const existingUser = await userService.getUserByUID(userId);
      if (!existingUser) {
        return sendError(res, 404, 'User not found');
      }

      // Check if registration is already complete
      if (userService.isRegistrationComplete(existingUser)) {
        return sendError(res, 400, 'User registration is already complete');
      }

      // Prepare registration data
      const registrationData = {
        name,
        description: description || '',
        profileImage: profileImage || '',
        termsConfirmation: {
          ...termsConfirmation,
          acceptedAt: new Date(termsConfirmation.acceptedAt)
        },
        addresses
      };

      // Complete registration
      const updatedUser = await userService.completeRegistration(userId, registrationData);
      
      logger.info(`Registration completed for user: ${userId}`);
      
      return sendSuccess(res, 'Registration successful! Redirecting to Home Screen.', {
        user: sanitizeUserData(updatedUser),
        redirectTo: 'HOME_SCREEN'
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return sendError(res, 500, error.message || 'Failed to complete registration');
    }
  }

  // Get customer profile
  async getProfile(req, res) {
    try {
      const { uid } = req.user; // From auth middleware
      
      const user = await userService.getUserByUID(uid);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      return sendSuccess(res, 'Profile retrieved successfully', {
        user: sanitizeUserData(user)
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return sendError(res, 500, 'Failed to retrieve profile');
    }
  }

  // Update customer profile
  async updateProfile(req, res) {
    try {
      const { uid } = req.user; // From auth middleware
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.phoneNumber;
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.createdAt;

      const updatedUser = await userService.updateUser(uid, updateData);
      
      return sendSuccess(res, 'Profile updated successfully', {
        user: sanitizeUserData(updatedUser)
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      return sendError(res, 500, 'Failed to update profile');
    }
  }

  // Add new address
  async addAddress(req, res) {
    try {
      const { uid } = req.user;
      const newAddress = req.body;

      const user = await userService.getUserByUID(uid);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      const updatedAddresses = [...(user.addresses || []), newAddress];
      
      const updatedUser = await userService.updateUser(uid, {
        addresses: updatedAddresses
      });

      return sendSuccess(res, 'Address added successfully', {
        user: sanitizeUserData(updatedUser)
      });
    } catch (error) {
      logger.error('Add address error:', error);
      return sendError(res, 500, 'Failed to add address');
    }
  }

  // Update selected address
  async updateSelectedAddress(req, res) {
    try {
      const { uid } = req.user;
      const { selectedAddress } = req.body;

      const updatedUser = await userService.updateUser(uid, {
        selectedAddress
      });

      return sendSuccess(res, 'Selected address updated successfully', {
        user: sanitizeUserData(updatedUser)
      });
    } catch (error) {
      logger.error('Update selected address error:', error);
      return sendError(res, 500, 'Failed to update selected address');
    }
  }

  // Add pet
  async addPet(req, res) {
    try {
      const { uid } = req.user;
      const newPet = req.body;

      const user = await userService.getUserByUID(uid);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      // Add pet ID if not provided
      if (!newPet.id) {
        newPet.id = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const updatedPets = [...(user.pets || []), newPet];
      
      const updatedUser = await userService.updateUser(uid, {
        pets: updatedPets
      });

      return sendSuccess(res, 'Pet added successfully', {
        user: sanitizeUserData(updatedUser)
      });
    } catch (error) {
      logger.error('Add pet error:', error);
      return sendError(res, 500, 'Failed to add pet');
    }
  }

  // Update FCM token
  async updateFCMToken(req, res) {
    try {
      const { uid } = req.user;
      const { fcmToken } = req.body;

      const updatedUser = await userService.updateUser(uid, {
        fcmToken
      });

      return sendSuccess(res, 'FCM token updated successfully');
    } catch (error) {
      logger.error('Update FCM token error:', error);
      return sendError(res, 500, 'Failed to update FCM token');
    }
  }
}

module.exports = new CustomerController();