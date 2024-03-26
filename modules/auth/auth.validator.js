const Joi = require("joi");

const signUp = {
  body: Joi.object()
    .required()
    .keys({
      firstName: Joi.string().required().min(3).max(15),
      lastName: Joi.string().required().min(3).max(15),
      email: Joi.string().email().required(),
      password: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)),
      cPassword: Joi.string().valid(Joi.ref("password")).required(),
    }),
};

const signIn = {
  body: Joi.object()
    .required()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string()
        .required(),
    }),
};

module.exports = { signUp ,signIn};
