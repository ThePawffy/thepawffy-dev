// models/vetBookingModel.js
const Joi = require("joi");

const vetBookingSchema = Joi.object({
  selectedAddress: Joi.object({
    fullAddress: Joi.string().required(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
  }).required(),

  selectedPetList: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        petType: Joi.string().required(),
        breed: Joi.string().allow(""),
        age: Joi.string().allow(""),
        gender: Joi.string().allow(""),
        color: Joi.string().allow(""),
        imageUrl: Joi.string().uri().allow(""),
        height: Joi.string().allow(""),
        weight: Joi.string().allow(""),
      })
    )
    .min(1)
    .required(),

  selectedService: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    price: Joi.number().optional(),
  }).required(),

  selectedPackage: Joi.object().allow(null, {}),
  isPackage: Joi.boolean().required(),

  userId: Joi.string().required(),
  vendorID: Joi.string().required(),

  bookingType: Joi.string().valid("veterinarian").required(),

  // 🔥 Replaced slotTime with serviceType
  serviceType: Joi.string()
    .valid("Clinic", "Vet Visit", "Online")
    .required(),

  PaymentStatus: Joi.string().allow("", "pending", "paid"),
});

module.exports = { vetBookingSchema };
