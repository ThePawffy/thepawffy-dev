const express = require('express');
const authRoutes = require('./auth');
const customerRoutes = require('./customer');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Pawffy Customer API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);

// API Info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Welcome to Pawffy Customer API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/send-otp': 'Send OTP to phone number',
        'POST /auth/verify-otp': 'Verify OTP and login/register',
        'POST /auth/refresh-token': 'Refresh authentication token',
        'POST /auth/logout': 'Logout user'
      },
      customer: {
        'POST /customer/register': 'Complete customer registration',
        'GET /customer/profile': 'Get customer profile',
        'PUT /customer/profile': 'Update customer profile',
        'POST /customer/address': 'Add new address',
        'PUT /customer/selected-address': 'Update selected address',
        'POST /customer/pet': 'Add new pet',
        'PUT /customer/fcm-token': 'Update FCM token'
      }
    }
  });
});

module.exports = router;