// models/foundPetModel.js
const Joi = require("joi");

const locationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  address: Joi.string().required(),
});

const foundPetSchema = Joi.object({
  images: Joi.array().items(Joi.string().uri()).length(3).required()
    .messages({ "array.length": "Exactly 3 image URLs are required." }),
  color: Joi.string().trim().required(),
  breed: Joi.string().trim().required(),
  location: locationSchema.required(),
  description: Joi.string().trim().required(),
  gender: Joi.string().valid("Male", "Female").required(),
});

module.exports = foundPetSchema;
