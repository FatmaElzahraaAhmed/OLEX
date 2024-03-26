const Joi = require("joi");

const updatePassword = {
  body: Joi.object()
    .required()
    .keys({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)),
      cPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    }),
};

const updateEmail = {
  body: Joi.object().required().keys({
    newEmail: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
const deleteUser = {
  body: Joi.object().required().keys({
    emailOfUserYouWantToDelete: Joi.string().email().required(),
  }),
};
const forgotPassword = {
  body: Joi.object().required().keys({
    email: Joi.string().email().required(),
  }),
};
const resetPassword = {
  body: Joi.object()
    .required()
    .keys({
      code: Joi.string().required(),
      newPassword: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)),
      cPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    }),
};
const softDelete = {
  body: Joi.object().required().keys({
    email: Joi.string().email().required(),
  }),
};
const getAllUsers = {
  body: Joi.object().required().keys({
  }),
};

module.exports = {
  updatePassword,
  updateEmail,
  deleteUser,
  forgotPassword,
  resetPassword,
  softDelete,
  getAllUsers,
};
