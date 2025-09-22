const { db } = require('../config/firebase');
const { createTimestamp } = require('../utils');
const logger = require('../utils/logger');

class UserService {
  constructor() {
    this.collection = db.collection('users');
  }

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber) {
    try {
      const snapshot = await this.collection
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      logger.error('Error getting user by phone number:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  // Get user by Firebase UID
  async getUserByUID(uid) {
    try {
      const doc = await this.collection.doc(uid).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      logger.error('Error getting user by UID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  // Create dummy user record after OTP verification
  async createDummyUser(phoneNumber, uid) {
    try {
      const now = createTimestamp();
      
      const dummyUserData = {
        id: uid,
        email: '',
        phoneNumber: phoneNumber,
        name: '',
        description: '',
        petType: '',
        profileImage: '',
        idProof: '',
        isActive: true,
        role: 'customer',
        selectedAddress: null,
        addresses: [],
        pet: null,
        pets: [],
        fcmToken: '',
        termsConfirmation: null,
        subscription: {
          planId: '',
          startDate: null,
          endDate: null,
          isActive: false,
          amount: 0,
          currency: 'INR'
        },
        isNumberLogin: true,
        createdAt: now,
        updatedAt: now
      };

      await this.collection.doc(uid).set(dummyUserData);
      logger.info(`Dummy user created for phone: ${phoneNumber}, UID: ${uid}`);

      return {
        id: uid,
        ...dummyUserData
      };
    } catch (error) {
      logger.error('Error creating dummy user:', error);
      throw new Error('Failed to create user record');
    }
  }

  // Complete user registration
  async completeRegistration(uid, registrationData) {
    try {
      const userRef = this.collection.doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const now = createTimestamp();
      
      // Prepare update data
      const updateData = {
        name: registrationData.name,
        description: registrationData.description || '',
        profileImage: registrationData.profileImage || '',
        addresses: registrationData.addresses,
        selectedAddress: registrationData.addresses[0] || null, // Set first address as selected
        termsConfirmation: registrationData.termsConfirmation,
        updatedAt: now
      };

      // Update the user document
      await userRef.update(updateData);
      
      // Get updated user document
      const updatedDoc = await userRef.get();
      
      logger.info(`User registration completed for UID: ${uid}`);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      logger.error('Error completing registration:', error);
      throw new Error('Failed to complete registration');
    }
  }

  // Update user data
  async updateUser(uid, updateData) {
    try {
      const userRef = this.collection.doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const now = createTimestamp();
      updateData.updatedAt = now;

      await userRef.update(updateData);
      
      const updatedDoc = await userRef.get();
      logger.info(`User updated for UID: ${uid}`);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Delete user (soft delete by setting isActive to false)
  async deleteUser(uid) {
    try {
      const userRef = this.collection.doc(uid);
      const now = createTimestamp();

      await userRef.update({
        isActive: false,
        updatedAt: now
      });

      logger.info(`User soft deleted for UID: ${uid}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Check if user registration is complete
  isRegistrationComplete(user) {
    return !!(
      user.name &&
      user.termsConfirmation &&
      user.termsConfirmation.accepted &&
      user.addresses &&
      user.addresses.length > 0
    );
  }
}

module.exports = new UserService();