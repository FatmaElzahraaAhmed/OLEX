const Joi = require("joi");

const addProduct={
    body:Joi.object().required().keys({
        productTitle:Joi.string().required(),
        productDesc:Joi.string().required(),
        productPrice:Joi.number().required(),
    })
}
const updateProduct={
    body:Joi.object().required().keys({
        productTitle:Joi.string().required(),
        productDesc:Joi.string().required(),
        productPrice:Joi.number().required(),
        _id:Joi.string().max(24).min(24).required(),
    })
}
const deleteProduct={
    body:Joi.object().required().keys({
        productId:Joi.string().max(24).min(24).required(),
    })
}
const softDeleteProduct={
    body:Joi.object().required().keys({
        productId:Joi.string().max(24).min(24).required(),
    })
}
const likeUnLikeProduct={
    params:Joi.object().required().keys({
        productId:Joi.string().max(24).min(24).required(),
    })
}
const addToWishlist={
    params:Joi.object().required().keys({
        productId:Joi.string().max(24).min(24).required(),
    })
}
const hideProduct={
    body:Joi.object().required().keys({
        productId:Joi.string().max(24).min(24).required(),
    })
}

module.exports = {addProduct,updateProduct,deleteProduct,softDeleteProduct,likeUnLikeProduct,addToWishlist,hideProduct};