const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    commentBody: { type: String, required: true },
    commentBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
    likes:[{type:mongoose.Schema.Types.ObjectId, ref: "user"}]
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.model("comment", commentSchema);

module.exports = commentModel;
