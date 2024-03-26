const userModel = require("../../../DB/model/user");
const productModel = require("../../../DB/model/product");
const sendEmail = require("../../../service/sendEmail");
var jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const pagination = require("../../../service/pagination");
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.userId);
    if (oldPassword == newPassword) {
      res
        .status(400)
        .json({ message: "new password can't equal old password" });
    } else {
      const match = bcrypt.compareSync(oldPassword, user.password);
      if (!match) {
        res.status(400).json({ message: "invalid password" });
      } else {
        const hashedPassword = await bcrypt.hashSync(
          newPassword,
          parseInt(process.env.saltRound)
        );
        let updatedUser = await userModel.findByIdAndUpdate(
          user._id,
          { password: hashedPassword , $inc: { __v: 1 }},
          { new: true }
        );
        res.status(200).json({ message: "updated password", updatedUser });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const user = await userModel.findById(req.userId);
    const foundedUser = await userModel.findOne({ newEmail });
    bcrypt.compare(password, user.password, async function (err, result) {
      if (result) {
        if (user.email == newEmail) {
          res.status(400).json({ message: "new email is already in use" });
        } else if (foundedUser) {
          res.status(400).json({ message: "Email already exists" });
        } else {
          const modifyEmail = await userModel.findOneAndUpdate(
            { email: user.email },
            { email: newEmail, confirmed: false, $inc: { __v: 1 } },
            { new: true }
          );
          var token = jwt.sign(
            { id: modifyEmail._id },
            process.env.verifyTokenKey
          );
          let URL = `${req.protocol}://${req.headers.host}/api/v1/auth/confirm/${token}`;
          await sendEmail(
            modifyEmail.email,
            `<a href=${URL}>Please click here to confirm your email</a>`
          );
          res.status(200).json({ message: "updated email", modifyEmail });
        }
      } else {
        res.status(400).json({ message: "Invalid password" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const email = req.body.emailOfUserYouWantToDelete;
    const user = await userModel.findById(req.userId);
    const foundUser = await userModel.findOne({ email });
    if (user) {
      if (foundUser) {
        if (email == user.email) {
          const deletedUser = await userModel.findOneAndRemove({ email });
          res
            .status(StatusCodes.OK)
            .json({ message: "Deleted Done", deletedUser });
        } else if (user.role == "admin" || user.role == "Admin") {
          if (foundUser.role == "admin" || foundUser.role == "Admin") {
            res
              .status(StatusCodes.BAD_REQUEST)
              .json({ message: "You can't delete another admin user" });
          } else if (foundUser.role == "user" || foundUser.role == "User") {
            const deletedUser = await userModel.findOneAndRemove({ email });
            res
              .status(StatusCodes.OK)
              .json({ message: "Deleted Done", deletedUser });
          } else {
            res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "User does not exist" });
          }
        } else if (user.role == "user" || user.role == "User") {
          res.status(StatusCodes.BAD_REQUEST).json({
            message: "You aren't admin, you can't delete another user",
          });
        } else {
          res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid Role" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(401).json({ message: "Invalid email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const addProfilePic = async (req, res) => {
  try {
    if (req.fileUploadError) {
      res.status(422).json({ message: "Invalid file" });
    } else {
      const user = await userModel.findById(req.userId);
      if (user) {
        let imagesURLS = [];
        for (let i = 0; i < req.files.length; i++) {
          let imgURL = `${req.protocol}://${req.headers.host}/${req.fileURL}/${req.files[i].filename}`;
          imagesURLS.push(imgURL);
        }
        let updatedUser = await userModel.findByIdAndUpdate(
          user._id,
          { profilePicture: imagesURLS , $inc: { __v: 1 }},
          { new: true }
        );
        res.status(200).json({
          message: "Profile picture updated successfully",
          updatedUser,
        });
      } else {
        res.status(404).json({ message: "Invalid user" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const addCoverPics = async (req, res) => {
  try {
    if (req.fileUploadError) {
      res.status(422).json({ message: "Invalid file" });
    } else {
      const user = await userModel.findById(req.userId);
      if (user) {
        let imagesURLS = [];
        for (let i = 0; i < req.files.length; i++) {
          let imgURL = `${req.protocol}://${req.headers.host}/${req.fileURL}/${req.files[i].filename}`;
          imagesURLS.push(imgURL);
        }
        let updatedUser = await userModel.findByIdAndUpdate(
          user._id,
          { coverPictures: imagesURLS , $inc: { __v: 1 }},
          { new: true }
        );
        res.status(200).json({
          message: "Cover pictures updated successfully",
          updatedUser,
        });
      } else {
        res.status(404).json({ message: "Invalid user" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
      await userModel.findOneAndUpdate({ email }, { code, $inc: { __v: 1 } });
      sendEmail(email, `<p>Use this code to reset your password: ${code}</p>`);
      res.status(200).json({ message: "Code sent to your email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    const user = await userModel.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      if (user.code.toString() != code.toString()) {
        res.status(409).json({ message: "Wrong code" });
      } else {
        const hashedPassword = await bcrypt.hash(
          newPassword,
          parseInt(process.env.saltRound)
        );
        const updatedUser = await userModel.findByIdAndUpdate(
          user._id,
          { password: hashedPassword, code: " ", $inc: { __v: 1 } },
          { new: true }
        );
        res
          .status(200)
          .json({ message: "Password reset successful", updatedUser });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const softDelete = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    const admin = await userModel.findById(req.userId);
    if (user) {
      if (user.isDeleted) {
        res.status(500).json({ message: "user is already marked as deleted." });
      } else {
        if (user.email == admin.email) {
          const updatedUser = await userModel.findOneAndUpdate(
            { email: req.body.email },
            { isDeleted: true, $inc: { __v: 1 } },
            { new: true }
          );
          res.status(200).json({
            message: "User marked as deleted successfully",
            updatedUser,
          });
        } else {
          res
            .status(500)
            .json({ message: "You can't delete another admin's account" });
        }
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { skip, limit } = pagination(page, size);
    const arr = [];
    for await (const user of userModel
      .find({ confirmed: true, isDeleted: false, blocked: false })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "wishlist", select: '-qrCode'
      })) {
      const productsOfUser = await productModel
        .find({ createdBy: user._id, isDeleted: false, hidden: false })
        .select("-qrCode")
        .limit(limit)
        .skip(skip)
        .populate({
          path: "comments",
          populate: {
            path: "replies",
          },
        });
      arr.push({
        User_Info: user,
        Products: productsOfUser,
      });
    }
    res.status(200).json({ message: "Done", Users: arr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updatePassword,
  updateEmail,
  deleteUser,
  addProfilePic,
  addCoverPics,
  forgotPassword,
  resetPassword,
  softDelete,
  getAllUsers,
};
