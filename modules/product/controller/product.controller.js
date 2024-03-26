const productModel = require("../../../DB/model/product");
const userModel = require("../../../DB/model/user");
const QRCode = require("qrcode");
const { getIO ,socketEvents} = require("../../../service/initSocket");

const addProduct = async (req, res) => {
  try {
    const { productTitle, productDesc, productPrice } = req.body;
    const user = await userModel.findById(req.userId);
    const addedProduct = new productModel({
      productTitle,
      productDesc,
      productPrice,
      createdBy: user._id,
    });
    const saved = await addedProduct.save();
    const qrData = await productModel
      .findOne({ _id: saved._id })
      .select("productTitle productDesc productPrice createdBy");
    QRCode.toDataURL(`${qrData}`, async function (err, url) {
      const update = await productModel.findByIdAndUpdate(
        addedProduct._id,
        { qrCode: url, $inc: { __v: 1 } },
        { new: true }
      );
      const saved = await update.save();
      const socketUser=await userModel.findById(req.userId).select("socketID");
      getIO().except(socketUser.socketID).emit(socketEvents.addProduct,[saved])
      res.status(200).json({ message: "Added", update });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productTitle, productDesc, productPrice, _id } = req.body;
    const foundProduct = await productModel.findOne({
      _id,
      createdBy: req.userId,
      isDeleted: false,
    });
    if (foundProduct) {
      if (
        productTitle == foundProduct.productTitle &&
        productDesc == foundProduct.productDesc &&
        productPrice == foundProduct.productPrice
      ) {
        return res.status(500).json({ message: "You didn't change anything" });
      } else {
        const updatedProduct = await productModel.findByIdAndUpdate(
          _id,
          {
            productTitle,
            productDesc,
            productPrice,
            qrCode: "",
            $inc: { __v: 1 },
          },
          { new: true }
        );
        const qrData = await productModel
          .findOne({ _id: updatedProduct._id })
          .select("productTitle productDesc productPrice createdBy");
        QRCode.toDataURL(`${qrData}`, async function (err, url) {
          const update = await productModel.findByIdAndUpdate(
            updatedProduct._id,
            { qrCode: url },
            { new: true }
          );
          res.status(200).json({ message: "Updated successfully", update });
        });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const product = await productModel.findById(req.body.productId);
    if (product) {
      if (user.role == "admin") {
        const deletedProduct = await productModel.findByIdAndRemove(
          product._id
        );
        res
          .status(200)
          .json({ message: "Deleted successfully", deletedProduct });
      } else if (user.role == "user") {
        if (product.createdBy.toString() == user._id.toString()) {
          const deletedProduct = await productModel.findByIdAndRemove(
            product._id
          );
          res
            .status(200)
            .json({ message: "Deleted successfully", deletedProduct });
        } else {
          res.status(500).json({
            message:
              "you can't delete another user's product as you're not admin",
          });
        }
      }
    } else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const softDeleteProduct = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const product = await productModel.findById(req.body.productId);
    if (product) {
      if (!product.isDeleted) {
        if (user.role == "admin") {
          const deletedProduct = await productModel.findByIdAndUpdate(
            product._id,
            { isDeleted: true, $inc: { __v: 1 } },
            { new: true }
          );
          res.status(200).json({
            message: "product marked as deleted successfully",
            deletedProduct,
          });
        } else if (user.role == "user") {
          if (product.createdBy.toString() == user._id.toString()) {
            const deletedProduct = await productModel.findByIdAndUpdate(
              product._id,
              { isDeleted: true, $inc: { __v: 1 } },
              { new: true }
            );
            res.status(200).json({
              message: "product marked as deleted successfully",
              deletedProduct,
            });
          } else {
            res.status(500).json({
              message:
                "you can't delete another user's product as you're not admin",
            });
          }
        }
      } else {
        res
          .status(404)
          .json({ message: "Product is already marked as deleted" });
      }
    } else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeUnLikeProduct = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product || product.isDeleted || product.hidden) {
      res.status(404).json({ message: "Product not found" });
    } else {
      if (product.createdBy.toString() == user._id.toString()) {
        res.status(400).json({ message: "You can't like your product" });
      } else {
        if (product.likes.includes(user._id.toString())) {
          const unLikedProduct = await productModel.findByIdAndUpdate(
            product._id,
            { $pull: { likes: user._id }, $inc: { __v: 1 } },
            { new: true }
          );
          res
            .status(200)
            .json({ message: "you unLiked product", unLikedProduct });
        } else {
          const likedProduct = await productModel.findByIdAndUpdate(
            product._id,
            { $push: { likes: user._id }, $inc: { __v: 1 } },
            { new: true }
          );
          res.status(200).json({ message: "you liked product", likedProduct });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product || product.isDeleted || product.hidden) {
      res.status(404).json({ message: "Product not found" });
    } else {
      if (
        user.wishlist.includes(product._id) &&
        product.wishlist.includes(user._id)
      ) {
        res.status(400).json({ message: "Product already added to wishlist" });
      } else {
        if (product.createdBy.toString() == user._id.toString()) {
          res
            .status(400)
            .json({ message: "you can't add your product to wishlist" });
        } else {
          const addToUserModel = await userModel.findByIdAndUpdate(
            user._id,
            { $push: { wishlist: product._id }, $inc: { __v: 1 } },
            { new: true }
          );

          const addToProductModel = await productModel.findByIdAndUpdate(
            product._id,
            { $push: { wishlist: user._id }, $inc: { __v: 1 } },
            { new: true }
          );
          res.status(200).json({
            message: "product added to wishlist successfully",
            addToProductModel,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const hideProduct = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const product = await productModel.findById(req.body.productId);
    if (
      user.role != "admin" &&
      product.createdBy.toString() != user._id.toString()
    ) {
      res.status(401).json({
        message: "You can't hide another user's product as you're not admin",
      });
    } else {
      if (!product || product.isDeleted) {
        res.status(404).json({ message: "Product not found" });
      } else {
        if (product.hidden) {
          res.status(400).json({ message: "Product is already hidden" });
        } else {
          const hiddenProduct = await productModel.findByIdAndUpdate(
            product._id,
            { hidden: true, $inc: { __v: 1 } },
            { new: true }
          );
          res
            .status(200)
            .json({ message: "you hid product successfully", hiddenProduct });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
  likeUnLikeProduct,
  addToWishlist,
  hideProduct,
};
