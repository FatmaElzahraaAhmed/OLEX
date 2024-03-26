const { auth } = require("../../middleware/auth");
const validationFun = require("../../middleware/validation");
const { addProduct,updateProduct ,deleteProduct,softDeleteProduct,likeUnLikeProduct,addToWishlist,hideProduct} = require("./controller/product.controller");
const  productValidation  = require("./product.validator");
const productAPI=require("./productRoles");
const router = require("express").Router();

router.post('/addProduct',auth(productAPI.addProduct),validationFun(productValidation.addProduct),addProduct)
router.patch('/updateProduct',auth(productAPI.updateProduct),validationFun(productValidation.updateProduct),updateProduct)
router.delete('/deleteProduct',auth(productAPI.deleteProduct),validationFun(productValidation.deleteProduct),deleteProduct)
router.patch('/softDeleteProduct',auth(productAPI.softDeleteProduct),validationFun(productValidation.softDeleteProduct),softDeleteProduct)
router.patch('/likeUnLikeProduct/:productId',auth(productAPI.likeUnLikeProduct),validationFun(productValidation.likeUnLikeProduct),likeUnLikeProduct)
router.patch('/addToWishlist/:productId',auth(productAPI.addToWishlist),validationFun(productValidation.addToWishlist),addToWishlist)
router.patch('/hideProduct',auth(productAPI.hideProduct),validationFun(productValidation.hideProduct),hideProduct)
module.exports = router;
