const Joi = require("joi");

const addressSchema = Joi.object({
  city: Joi.string().required(),
  country: Joi.string().required(),
  direction: Joi.string().allow("").required(),
  full_address: Joi.string().required(),
  houseNo: Joi.string().allow("").required(),
  landmark: Joi.string().allow("").required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  locality: Joi.string().allow("").required(),
  postal_code: Joi.string().required(),
  state: Joi.string().required(),
  tag: Joi.string().allow("").required(),
  createdAt: Joi.string().isoDate().allow(null).required(),
});

const petBreedSchema = Joi.object().unknown(true).required();

const petSchema = Joi.object({
  ageInMonths: Joi.number().required(),
  aggressionLevel: Joi.string().allow("").required(),
  gender: Joi.string().valid("Male", "Female").required(),
  imagePath: Joi.string().uri().allow("").required(),
  isVaccinated: Joi.boolean().required(),
  name: Joi.string().required(),
  petBreedList: Joi.array().items(petBreedSchema).required(),
  petType: Joi.string().required(),
  weightInKg: Joi.number().required(),
});

const userSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  profileImage: Joi.string().uri().allow("").required(),
  description: Joi.string().allow("").required(),
  fcmToken: Joi.string().required(),
  role: Joi.string().required(),
  isActive: Joi.boolean().required(),
  isNumberLogin: Joi.boolean().required(),
  isPending: Joi.boolean().required(),
  isRejected: Joi.boolean().required(),
  isVerified: Joi.boolean().required(),
  idProof: Joi.string().allow("").required(),
  pet: petSchema.required(),
  addresses: Joi.array().items(addressSchema).required(),
  pets: Joi.array().items(petSchema).required(),
  selectedAddress: addressSchema.required(),
});

const subscriptionSchema = Joi.object({
  id: Joi.string().required(),
  packageId: Joi.string().required(),
  price: Joi.string().required(),
  createdAt: Joi.string().isoDate().required(),
  expireAt: Joi.string().isoDate().required(),
  renewedAt: Joi.string().isoDate().required(),
});

const termsConfirmationSchema = Joi.object({
  confirmedAt: Joi.string().isoDate().required(),
  isConfirmed: Joi.boolean().required(),
  userId: Joi.string().required(),
});

const lostPetSchema = Joi.object({
  createdAt: Joi.string().isoDate().required(),
  currentAddress: addressSchema.required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  direction: Joi.string().allow("").required(),
  full_address: Joi.string().required(),
  houseNo: Joi.string().allow("").required(),
  landmark: Joi.string().allow("").required(),
  locality: Joi.string().allow("").required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  postal_code: Joi.string().required(),
  state: Joi.string().required(),
  tag: Joi.string().allow("").required(),

  genderOfPet: Joi.string().valid("Male", "Female").required(),
  height: Joi.string().allow("").required(),
  weight: Joi.string().allow("").required(),

  petBreedList: Joi.array().items(petBreedSchema).required(),
  petDescription: Joi.string().allow("").required(),

  petImagePath1: Joi.string().uri().allow("").required(),
  petImagePath2: Joi.string().uri().allow("").required(),
  petImagePath3: Joi.string().uri().allow("").required(),
  petImagePath4: Joi.string().uri().allow("").required(),

  petName: Joi.string().required(),
  petType: Joi.string().required(),
  typeOfPost: Joi.string().valid("Lost", "Found").required(),

  user: userSchema.required(),
  addresses: Joi.array().items(addressSchema).required(),
  pets: Joi.array().items(petSchema).required(),

  subscription: subscriptionSchema.required(),
  termsConfirmation: termsConfirmationSchema.required(),
});

module.exports = { lostPetSchema };
