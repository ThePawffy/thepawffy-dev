const Joi = require("joi");

// Address schema
const addressSchema = Joi.object({
  fullAddress: Joi.string().allow(""),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  postalCode: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  country: Joi.string().allow(""),
  locality: Joi.string().allow(""),
  landmark: Joi.string().allow(""),
  direction: Joi.string().allow(""),
  houseNo: Joi.string().allow(""),
  tag: Joi.string().allow(""),
});

// Terms schema 
const termsSchema = Joi.object({
  accepted: Joi.boolean().default(false),
  acceptedAt: Joi.date().allow(null),
});

// Subscription schema now optional
const subscriptionSchema = Joi.object({
  planId: Joi.string().optional(),
  startDate: Joi.date().allow(null).optional(),
  endDate: Joi.date().allow(null).optional(),
  isActive: Joi.boolean().optional(),
}).optional();

const userSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().allow(""),
  phoneNumber: Joi.string().allow(""),
  name: Joi.string().allow(""),
  description: Joi.string().allow(""),

  profileImage: Joi.string().uri().allow("").optional(),
  dProof: Joi.string().allow("").optional(),
  role: Joi.string().valid("customer", "admin", "partner").optional(),

  selectedAddress: addressSchema.optional(),
  addresses: Joi.array().items(addressSchema).optional(),

  fcmToken: Joi.string().allow("").optional(),
  termsConfirmation: termsSchema.optional(),
  createdAt: Joi.any(), // Firestore serverTimestamp

  subscription: subscriptionSchema,
  isNumberLogin: Joi.boolean().allow(null).optional(),
});

module.exports = { userSchema };
