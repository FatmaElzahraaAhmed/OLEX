const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    profilePicture: [String],
    coverPictures: [String],
    Qr_code: String,
    confirmed: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    isDeleted: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    code: { type: String, default: " " },
    socketID: String,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hashSync(
    this.password,
    parseInt(process.env.saltRounds)
  );
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
