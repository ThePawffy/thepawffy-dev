const Joi = require('joi');

// Address Model
const AddressModel = Joi.object({
  full_address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  postal_code: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  locality: Joi.string().required(),
  landmark: Joi.string().allow(''),
  direction: Joi.string().allow(''),
  houseNo: Joi.string().required(),
  tag: Joi.string().valid('Home', 'Work', 'Other').required()
});

// Pet Model
const PetModel = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required(),
  type: Joi.string().required(), // Dog, Cat, etc.
  breed: Joi.string().allow(''),
  age: Joi.number().integer().min(0),
  gender: Joi.string().valid('Male', 'Female'),
  weight: Joi.number().min(0),
  profileImage: Joi.string().uri().allow(''),
  medicalHistory: Joi.array().items(Joi.string()).default([]),
  vaccinations: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    date: Joi.date().required(),
    nextDue: Joi.date().optional()
  })).default([]),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().default(() => new Date())
});

// Terms Confirmation Model
const TermsConfirmationModel = Joi.object({
  accepted: Joi.boolean().required(),
  acceptedAt: Joi.date().required(),
  version: Joi.string().default('1.0')
});

// Subscription Model
const SubscriptionModel = Joi.object({
  planId: Joi.string().allow(''),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  isActive: Joi.boolean().default(false),
  amount: Joi.number().min(0).default(0),
  currency: Joi.string().default('INR')
});

// User Model
const UserModel = Joi.object({
  id: Joi.string().optional(),
  email: Joi.string().email().allow(''),
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  name: Joi.string().allow(''),
  description: Joi.string().allow(''),
  petType: Joi.string().allow(''),
  profileImage: Joi.string().uri().allow(''),
  idProof: Joi.string().allow(''),
  isActive: Joi.boolean().default(true),
  role: Joi.string().valid('customer', 'provider', 'admin').default('customer'),
  selectedAddress: Joi.object().allow(null).default(null),
  addresses: Joi.array().items(AddressModel).default([]),
  pet: Joi.object().allow(null).default(null), // Legacy field
  pets: Joi.array().items(PetModel).default([]),
  fcmToken: Joi.string().allow(''),
  termsConfirmation: TermsConfirmationModel.allow(null).default(null),
  subscription: SubscriptionModel.default({
    planId: '',
    startDate: null,
    endDate: null,
    isActive: false,
    amount: 0,
    currency: 'INR'
  }),
  isNumberLogin: Joi.boolean().default(true),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date())
});

// Request Validation Schemas
const SendOTPSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
});

const VerifyOTPSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  verificationId: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

const CustomerRegistrationSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).allow(''),
  profileImage: Joi.string().uri().allow(''),
  location: Joi.string().allow(''),
  termsConfirmation: TermsConfirmationModel.required(),
  addresses: Joi.array().items(AddressModel).min(1).required()
});

module.exports = {
  AddressModel,
  PetModel,
  TermsConfirmationModel,
  SubscriptionModel,
  UserModel,
  SendOTPSchema,
  VerifyOTPSchema,
  CustomerRegistrationSchema
};