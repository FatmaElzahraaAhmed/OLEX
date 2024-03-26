const { accessRoles } = require("../../middleware/auth");

const userAPI={
    updatePassword:[accessRoles.User],
    updateEmail:[accessRoles.User],
    deleteUser:[accessRoles.User,accessRoles.Admin],
    addProfilePic:[accessRoles.User],
    addCoverPics:[accessRoles.User],
    forgotPassword:[accessRoles.User,accessRoles.Admin],
    resetPassword:[accessRoles.User,accessRoles.Admin],
    softDelete:[accessRoles.Admin],
    getAllUsers:[accessRoles.Admin],
}



module.exports=userAPI;