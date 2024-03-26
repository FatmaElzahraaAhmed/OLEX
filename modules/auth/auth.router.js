const { signUp,confirmEmail,signIn } = require('./controller/auth.controller');
const router = require('express').Router();
const authValidation = require("./auth.validator");
const validationFun = require('../../middleware/validation');
router.post("/signUp",validationFun(authValidation.signUp),signUp);
router.get("/confirm/:token",confirmEmail);
router.get("/confirm",confirmEmail);
router.post("/signIn",validationFun(authValidation.signIn),signIn);




module.exports =router;