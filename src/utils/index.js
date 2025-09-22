// Response Helper
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  const response = {
    status: statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Success Response
const sendSuccess = (res, message, data = null) => {
  return sendResponse(res, 200, message, data);
};

// Error Response
const sendError = (res, statusCode, message, errors = null) => {
  return sendResponse(res, statusCode, message, null, errors);
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Format phone number to E.164
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it's an Indian number
  if (!formatted.startsWith('+')) {
    formatted = '+91' + formatted;
  }
  
  return formatted;
};

// Validate phone number format
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

// Create timestamp
const createTimestamp = () => {
  return new Date();
};

// Convert Firestore timestamp to ISO string
const firestoreTimestampToISO = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return null;
  }
  return timestamp.toDate().toISOString();
};

// Sanitize user data for response
const sanitizeUserData = (user) => {
  const sanitized = { ...user };
  
  // Remove sensitive fields if needed
  delete sanitized.fcmToken;
  
  // Convert timestamps
  if (sanitized.createdAt && sanitized.createdAt.toDate) {
    sanitized.createdAt = firestoreTimestampToISO(sanitized.createdAt);
  }
  
  if (sanitized.updatedAt && sanitized.updatedAt.toDate) {
    sanitized.updatedAt = firestoreTimestampToISO(sanitized.updatedAt);
  }
  
  return sanitized;
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  generateId,
  formatPhoneNumber,
  isValidPhoneNumber,
  createTimestamp,
  firestoreTimestampToISO,
  sanitizeUserData
};