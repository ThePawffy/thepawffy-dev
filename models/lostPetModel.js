const Joi = require("joi");

const locationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  address: Joi.string().required(),
});

const createLostPetSchema = Joi.object({
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
  breed: Joi.string().trim().required(),
  height: Joi.string().trim().required(),
  weight: Joi.string().trim().required(),
  location: locationSchema.required(),
  description: Joi.string().trim().required(),
  gender: Joi.string().valid("Male", "Female", "Prefer Not to Say").required(),
  userId: Joi.string().required(),
  postType: Joi.string().valid("Lost").required(),
});

const updateLostPetSchema = Joi.object({
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(3)
    .messages({
      "array.min": "At least 1 image is required.",
      "array.max": "You can upload a maximum of 3 images.",
    }),
  name: Joi.string().trim(),
  age: Joi.number().min(0),
  color: Joi.string().trim(),
  breed: Joi.string().trim(),
  height: Joi.string().trim(),
  weight: Joi.string().trim(),
  location: locationSchema,
  description: Joi.string().trim(),
  gender: Joi.string().valid("Male", "Female","Prefer Not to Say"),
  userId: Joi.string(),
  postType: Joi.string().valid("Lost"),
});

module.exports = {
  createLostPetSchema,
  updateLostPetSchema,
};
