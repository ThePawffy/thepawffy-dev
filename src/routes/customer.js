const express = require('express');
const customerController = require('../controllers/customerController');
const { validate, authenticateToken } = require('../middleware');
const { CustomerRegistrationSchema, AddressModel, PetModel } = require('../models');
const Joi = require('joi');

const router = express.Router();

// Validation schemas for additional endpoints
const UpdateFCMTokenSchema = Joi.object({
  fcmToken: Joi.string().required()
});

const UpdateSelectedAddressSchema = Joi.object({
  selectedAddress: AddressModel.required()
});

// @route   POST /customer/register
// @desc    Complete customer registration after OTP verification
// @access  Public (but requires valid userId from OTP verification)
router.post('/register', validate(CustomerRegistrationSchema), customerController.register);

// @route   GET /customer/profile
// @desc    Get customer profile
// @access  Private
router.get('/profile', authenticateToken, customerController.getProfile);

// @route   PUT /customer/profile
// @desc    Update customer profile
// @access  Private
router.put('/profile', authenticateToken, customerController.updateProfile);

// @route   POST /customer/address
// @desc    Add new address
// @access  Private
router.post('/address', authenticateToken, validate(AddressModel), customerController.addAddress);

// @route   PUT /customer/selected-address
// @desc    Update selected address
// @access  Private
router.put('/selected-address', authenticateToken, validate(UpdateSelectedAddressSchema), customerController.updateSelectedAddress);

// @route   POST /customer/pet
// @desc    Add new pet
// @access  Private
router.post('/pet', authenticateToken, validate(PetModel), customerController.addPet);

// @route   PUT /customer/fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.put('/fcm-token', authenticateToken, validate(UpdateFCMTokenSchema), customerController.updateFCMToken);

module.exports = router;