const commentModel = require("../../../DB/model/comment");
const productModel = require("../../../DB/model/product");
const userModel = require("../../../DB/model/user");
const { getIO, socketEvents } = require("../../../service/initSocket");
const addComment = async (req, res) => {
  try {
    const { commentBody, productId } = req.body;
    const foundProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
      hidden: false,
    });
    if (!foundProduct) {
      res.status(404).json({ message: "Product not found" });
    } else {
      const newComment = new commentModel({
        commentBody,
        productId,
        commentBy: req.userId,
      });
      const saved = await newComment.save();
      const addedToProduct = await productModel.findByIdAndUpdate(
        productId,
        {
          $push: { comments: newComment._id }, $inc: { __v: 1 }
        },
        { new: true }
      );
      const socketUser=await userModel.findById(req.userId).select("socketID");
      getIO().except(socketUser.socketID).emit(socketEvents.addComment,[saved])
      res.status(200).json({
        message: "comment added to product successfully",
        addedToProduct,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { replyBody, commentId } = req.body;
    const foundComment = await commentModel.findById(commentId);
    if (!foundComment) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      const newReply = await commentModel({
        commentBody: replyBody,
        commentBy: req.userId,
      });
      const saved = await newReply.save();
      const comment = await commentModel.findByIdAndUpdate(
        { _id: commentId },
        { $push: { replies: saved._id }, $inc: { __v: 1 } },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "reply added to comment successfully", comment });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentBody, commentId } = req.body;
    const foundComment = await commentModel.findById(commentId);
    if (foundComment) {
      if (foundComment.commentBy.toString() == req.userId) {
        if (foundComment.commentBody == commentBody) {
          res.status(500).json({ message: "you didn't change the comment" });
        } else {
          const updateComment = await commentModel.findByIdAndUpdate(
            commentId,
            { commentBody, $inc: { __v: 1 } },
            { new: true }
          );
          res
            .status(200)
            .json({ message: "comment updated successfully", updateComment });
        }
      } else {
        res
          .status(400)
          .json({ message: "you can't change another user's comment" });
      }
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.userId;
    const foundComment = await commentModel.findById(commentId);
    if (foundComment) {
      const product = await productModel.findById(foundComment.productId);
      if (
        user.role == "admin" ||
        foundComment.commentBy.toString() == user._id.toString() ||
        product.createdBy.toString() == user._id.toString()
      ) {
        const deleteComment = await commentModel.findByIdAndRemove(commentId);
        res
          .status(200)
          .json({ message: "comment deleted successfully", deleteComment });
      } else {
        res
          .status(400)
          .json({ message: "You can't delete another user's comment" });
      }
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeUnLikeComment = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const { commentId } = req.params;
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "comment not found" });
    } else {
      if (comment.commentBy.toString() == user._id.toString()) {
        res.status(400).json({ message: "You can't like your comment" });
      } else {
        if (comment.likes.includes(user._id.toString())) {
          const unLikedComment = await commentModel.findByIdAndUpdate(
            comment._id,
            { $pull: { likes: user._id }, $inc: { __v: 1 } },
            { new: true }
          );
          res
            .status(200)
            .json({ message: "you unLiked comment", unLikedComment });
        } else {
          const likedComment = await commentModel.findByIdAndUpdate(
            comment._id,
            { $push: { likes: user._id }, $inc: { __v: 1 } },
            { new: true }
          );
          res.status(200).json({ message: "you liked comment", likedComment });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  addReply,
  updateComment,
  deleteComment,
  likeUnLikeComment,
};
