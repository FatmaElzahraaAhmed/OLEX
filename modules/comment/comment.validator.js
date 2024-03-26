const Joi = require("joi");

const addComment={
    body:Joi.object().required().keys({
        commentBody:Joi.string().required(),
        productId:Joi.string().max(24).min(24).required()
    })
}
const addReply={
    body:Joi.object().required().keys({
        replyBody:Joi.string().required(),
        commentId:Joi.string().max(24).min(24).required()
    })
}
const updateComment={
    body:Joi.object().required().keys({
        commentBody:Joi.string().required(),
        commentId:Joi.string().max(24).min(24).required()
    })
}

const deleteComment={
    params:Joi.object().required().keys({
        commentId:Joi.string().max(24).min(24).required()
    })
}
const likeUnLikeComment={
    params:Joi.object().required().keys({
        commentId:Joi.string().max(24).min(24).required()
    })
}


module.exports={addComment,addReply,updateComment,deleteComment,likeUnLikeComment}