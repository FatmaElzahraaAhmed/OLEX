const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productTitle: { type: String, required: true },
    productDesc: { type: String, required: true },
    productPrice: { type: Number, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    hidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    qrCode: { type: String},
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
