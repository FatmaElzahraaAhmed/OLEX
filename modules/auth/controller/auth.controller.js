const userModel = require("../../../DB/model/user");
const { StatusCodes } = require("http-status-codes");
const sendEmail = require("../../../service/sendEmail");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const foundedUser = await userModel.findOne({ email });
    if (foundedUser) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email already exists" });
    } else {
      const user = new userModel({ firstName, lastName, email, password });
      const savedUser = await user.save();
      var token = jwt.sign({ id: savedUser._id }, process.env.verifyTokenKey);
      let URL = `${req.protocol}://${req.headers.host}/api/v1/auth/confirm/${token}`;
      await sendEmail(
        email,
        `<a href=${URL}>Please click here to confirm your email</a>`
      ); 
      res
        .status(StatusCodes.CREATED)
        .json({ message: "Added Done", savedUser });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Catch error", error });
  }
};

const confirmEmail = async (req, res) => {
  try {
    let { token } = req.params;

    if (token == undefined || token == null || !token) {
      res.status(404).json({ message: "You should have a token" });
    } else {
      let decoded = jwt.verify(token, process.env.verifyTokenKey);
      if (decoded) {
        let { id } = decoded;
        let foundedUser = await userModel.findById(id);
        if (foundedUser) {
          if (foundedUser.confirmed) {
            res.status(400).json({ message: "Email already confirmed" });
          } else {
            let updateUser = await userModel.findByIdAndUpdate(
              foundedUser._id,
              { confirmed: true },
              { new: true }
            );
            res
              .status(200)
              .json({ message: "Email confirmed successfully", updateUser });
          }
        } else {
          res.status(400).json({ message: "invalid email" });
        }
      } else {
        res.status(403).json({ message: "Invalid token" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid token", error });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
  const foundedUser = await userModel.findOne({ email });
  if (foundedUser) {
    if (foundedUser.blocked) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'This account is blocked by admin'
      })
    }
    if (foundedUser.isDeleted) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'This account is marked as deleted' })
    }
    if (foundedUser.confirmed&&!foundedUser.blocked&&!foundedUser.isDeleted) {
      bcrypt.compare(password, foundedUser.password, function (err, result) {
        if (result) {
          var token = jwt.sign(
            { id: foundedUser._id, isLogin: true },
            process.env.verifyTokenKey
          );
          res.json({ message: "Welcome", token });
        } else {
          res.status(422).json({ message: "Password incorrect" });
        }
      });
    } else {
      res.status(422).json({ message: "You have to verify your email first" });
    }
  } else {
    res
      .status(404)
      .json({ message: "Email doesn't exist, please register first" });
  }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signUp, confirmEmail,signIn };
