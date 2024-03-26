const { accessRoles } = require("../../middleware/auth");



const commentAPI={
    addComment:[accessRoles.User],
    addReply:[accessRoles.User],
    updateComment:[accessRoles.User],
    deleteComment:[accessRoles.User,accessRoles.Admin],
    likeUnLikeComment:[accessRoles.User],
}



module.exports=commentAPI;