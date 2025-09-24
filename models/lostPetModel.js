const Joi = require("joi");

const lostPetSchema = Joi.object({
  createdAt: Joi.string().isoDate().optional(),

  currentAddress: Joi.object().optional(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  direction: Joi.string().allow("").optional(),
  full_address: Joi.string().required(),
  houseNo: Joi.string().allow("").optional(),
  landmark: Joi.string().allow("").optional(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  postal_code: Joi.string().required(),
  state: Joi.string().required(),
  tag: Joi.string().allow("").optional(),

  genderOfPet: Joi.string().valid("Male", "Female").optional(),
  height: Joi.string().allow("").optional(),

  petBreedList: Joi.array().items(Joi.any()).optional(),
  petDescription: Joi.string().allow("").optional(),

  petImagePath1: Joi.string().uri().allow("").optional(),
  petImagePath2: Joi.string().uri().allow("").optional(),
  petImagePath3: Joi.string().uri().allow("").optional(),
  petImagePath4: Joi.string().uri().allow("").optional(),

  petName: Joi.string().required(),
  petType: Joi.string().required(),
  typeOfPost: Joi.string().valid("Lost", "Found").required(),

  user: Joi.object().optional(),
  addresses: Joi.array().items(Joi.object()).optional(),
  pets: Joi.array().items(Joi.object()).optional(),

  subscription: Joi.object().optional(),
  termsConfirmation: Joi.object().optional(),
  weight: Joi.string().allow("").optional(),
});

module.exports = { lostPetSchema };
