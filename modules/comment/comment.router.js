const { auth } = require("../../middleware/auth");
const validationFun = require("../../middleware/validation");
const { addComment ,addReply,updateComment,deleteComment,likeUnLikeComment} = require("./controller/comment.controller");
const  commentValidation  = require("./comment.validator");
const commentAPI=require("./commentRoles");
const router = require("express").Router();


router.post('/addComment',auth(commentAPI.addComment),validationFun(commentValidation.addComment),addComment)
router.post('/addReply',auth(commentAPI.addReply),validationFun(commentValidation.addReply),addReply)
router.patch('/updateComment',auth(commentAPI.updateComment),validationFun(commentValidation.updateComment),updateComment)
router.delete('/deleteComment/:commentId',auth(commentAPI.deleteComment),validationFun(commentValidation.deleteComment),deleteComment)
router.patch('/likeUnLikeComment/:commentId',auth(commentAPI.likeUnLikeComment),validationFun(commentValidation.likeUnLikeComment),likeUnLikeComment)



module.exports=router;