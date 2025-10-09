const Joi = require("joi");

const locationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  address: Joi.string().required(),
});

const createFoundPetSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1) // ✅ at least 1 image required
    .max(3) // ✅ at most 3 images allowed
    .required()
    .messages({
      "array.min": "At least 1 image is required.",
      "array.max": "You can upload a maximum of 3 images.",
    }),
  color: Joi.string().trim().required(),
  breed: Joi.string().trim().required(),
  location: locationSchema.required(),
  description: Joi.string().trim().required(),
  gender: Joi.string().valid("Male", "Female").required(),
  userId: Joi.string().required(), // ✅ userId sent by client
  postType: Joi.string().valid("Found").required(), // ✅ must always be 'Found'
});

// For updates: all fields optional, but still validated properly
const updateFoundPetSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(3)
    .messages({
      "array.min": "At least 1 image is required.",
      "array.max": "You can upload a maximum of 3 images.",
    }),
  color: Joi.string().trim(),
  breed: Joi.string().trim(),
  location: locationSchema,
  description: Joi.string().trim(),
  gender: Joi.string().valid("Male", "Female"),
  userId: Joi.string(),
  postType: Joi.string().valid("Found"),
});

module.exports = {
  createFoundPetSchema,
  updateFoundPetSchema,
};
