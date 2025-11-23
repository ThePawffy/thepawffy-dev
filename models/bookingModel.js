const Joi = require("joi");

const slotTimeSchema = Joi.object({
  morningSlot: Joi.string().allow(""),
  eveningSlot: Joi.string().allow(""),
});

const walkingBookingSchema = Joi.object({
  selectedAddress: Joi.object({
    fullAddress: Joi.string().required(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
  }).required(),

  selectedDays: Joi.string().required(),

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

  partnerID: Joi.string().required(), // updated
  partnerId: Joi.string().optional(), // accept both

  bookingType: Joi.string().valid("walking").required(),
  walkingType: Joi.string().valid("Once a day", "Twice a day").required(),

  slotTime: slotTimeSchema.required(),
  walkingDuration: Joi.string().required(),

  PaymentStatus: Joi.string().allow("", "pending", "paid"),
});

module.exports = { walkingBookingSchema };
