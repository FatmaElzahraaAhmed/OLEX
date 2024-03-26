const { accessRoles } = require("../../middleware/auth");

const productAPI={
    addProduct:[accessRoles.User],
    updateProduct:[accessRoles.User],
    deleteProduct:[accessRoles.User,accessRoles.Admin],
    softDeleteProduct:[accessRoles.User,accessRoles.Admin],
    likeUnLikeProduct:[accessRoles.User],
    addToWishlist:[accessRoles.User],
    hideProduct:[accessRoles.User,accessRoles.Admin],
}


module.exports=productAPI