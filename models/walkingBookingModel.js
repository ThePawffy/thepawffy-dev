// models/walkingBookingModel.js
const Joi = require("joi");

// Slot schema
const slotTimeSchema = Joi.object({
  morningSlot: Joi.string().allow("", null),
  eveningSlot: Joi.string().allow("", null),
}).unknown(true);

// Address Schema (matches your incoming object)
const addressSchema = Joi.object({
  tag: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  id: Joi.string().optional(),
  landmark: Joi.string().allow(""),
  houseNo: Joi.string().allow(""),
  fullAddress: Joi.string().required(),         // required
  city: Joi.string().optional(),
  locality: Joi.string().optional(),
  latitude: Joi.number().optional(),
  direction: Joi.string().allow(""),
  longitude: Joi.number().optional(),
  postalCode: Joi.string().optional(),
}).unknown(true); // allow any extra address fields safely

// Pet details schema
const petSchema = Joi.object({
  name: Joi.string().required(),
  petType: Joi.string().required(),
  breed: Joi.string().allow(""),
  age: Joi.string().allow(""),
  gender: Joi.string().allow(""),
  color: Joi.string().allow(""),
  imageUrl: Joi.string().uri().allow(""),
  height: Joi.string().allow(""),
  weight: Joi.string().allow(""),
}).unknown(true);

// Service schema (updated to match your real payload)
const serviceSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  expertise: Joi.string().allow(""),
  consultationType: Joi.string().allow(""),
  noOfSessions: Joi.string().allow(""),
  info: Joi.string().allow(""),
  price: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
}).unknown(true);

const walkingBookingSchema = Joi.object({
  selectedAddress: addressSchema.required(),

  selectedDays: Joi.string().required(),

  selectedPetList: Joi.array().items(petSchema).min(1).required(),

  selectedService: serviceSchema.required(),

  selectedPackage: Joi.object().allow(null, {}),
  isPackage: Joi.boolean().required(),

  userId: Joi.string().required(),
  partnerID: Joi.string().required(),   // updated: vendorID → partnerID

  bookingType: Joi.string().valid("walking").required(),
  walkingType: Joi.string().valid("Once a day", "Twice a day").required(),

  slotTime: slotTimeSchema.required(),

  walkingDuration: Joi.string().required(),

  PaymentStatus: Joi.string().allow("", "pending", "paid"),
}).unknown(true);

module.exports = { walkingBookingSchema };
