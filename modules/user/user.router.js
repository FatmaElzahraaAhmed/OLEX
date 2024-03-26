const router = require('express').Router();
const {auth} = require('../../middleware/auth');
const {updatePassword,updateEmail,deleteUser,addProfilePic,addCoverPics,forgotPassword,resetPassword,softDelete,getAllUsers} = require('./controller/user.controller');
const userAPI = require('./userRoles');
const userValidation = require("./user.validator");
const validationFun = require('../../middleware/validation');
const { uploadData,fileExtensions, HME } = require('../../service/uploadFile');


router.patch("/updatePassword",auth(userAPI.updatePassword),validationFun(userValidation.updatePassword),updatePassword)
router.patch("/updateEmail",auth(userAPI.updateEmail),validationFun(userValidation.updateEmail),updateEmail)
router.delete("/deleteUser",auth(userAPI.deleteUser),validationFun(userValidation.deleteUser),deleteUser)
router.patch("/addProfilePic",auth(userAPI.addProfilePic),uploadData("images/profilePic",fileExtensions.image).array("image",2),HME,addProfilePic)
router.patch("/addCoverPics",auth(userAPI.addCoverPics),uploadData("images/coverPics",fileExtensions.image).array("image",5),HME,addCoverPics)
router.post("/forgotPassword",auth(userAPI.forgotPassword),validationFun(userValidation.forgotPassword),forgotPassword)
router.post("/resetPassword",auth(userAPI.resetPassword),validationFun(userValidation.resetPassword),resetPassword)
router.patch("/softDelete",auth(userAPI.softDelete),validationFun(userValidation.softDelete),softDelete)
router.get("/getAllUsers",auth(userAPI.getAllUsers),validationFun(userValidation.getAllUsers),getAllUsers)

module.exports = router;