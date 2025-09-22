const express = require('express');
const authController = require('../controllers/authController');
const { validate, authenticateToken } = require('../middleware');
const { SendOTPSchema, VerifyOTPSchema } = require('../models');

const router = express.Router();

// @route   POST /auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', validate(SendOTPSchema), authController.sendOTP);

// @route   POST /auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', validate(VerifyOTPSchema), authController.verifyOTP);

// @route   POST /auth/refresh-token
// @desc    Refresh authentication token
// @access  Private
router.post('/refresh-token', authenticateToken, authController.refreshToken);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;