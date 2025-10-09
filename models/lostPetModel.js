// models/lostPetModel.js
const Joi = require("joi");

const locationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  address: Joi.string().required(),
});

const lostPetSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(3)
    .required()
    .messages({
      "array.min": "At least 1 image is required.",
      "array.max": "You can upload a maximum of 3 images.",
    }),

  name: Joi.string().trim().required(),
  age: Joi.number().min(0).required(),
  color: Joi.string().trim().required(),
  height: Joi.string().trim().required(),
  weight: Joi.string().trim().required(),
  breed: Joi.string().trim().required(),
  gender: Joi.string().valid("Male", "Female", "Prefer Not to Say").required(),
  description: Joi.string().trim().required(),

  location: locationSchema.required(),

  userId: Joi.string().required(),
  postType: Joi.string().valid("Lost").required(), // must be "Lost"
  createdAt: Joi.date().iso().default(() => new Date().toISOString()),
});

module.exports = { lostPetSchema };
