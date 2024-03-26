var jwt = require("jsonwebtoken");
const userModel = require("../DB/model/user");
const accessRoles = {
  Admin: "admin",
  User: "user",
};

const auth = (accessRoles) => {
  return async (req, res, next) => {
    try {
      if (
        !req.headers ||
        req.headers == null ||
        req.headers == undefined ||
        !req.headers["authorization"] ||
        !req.headers["authorization"].startsWith("Bearer ")
      ) {
        res.status(404).json({ message: "Header token error" });
      } else {
        let authKey = req.headers["authorization"];
        let token = authKey.split(" ")[1];
        if (!token || token == null || token == undefined || token.length < 1) {
          res.status(401).json({ message: "Invalid token" });
        } else {
          let verifiedKey = jwt.verify(token, process.env.verifyTokenKey);
          if (verifiedKey) {
            let user = await userModel.findById(verifiedKey.id);
            if (user) {
              if (accessRoles.includes(user.role)) {
                if (user) {
                  req.userId = user._id;
                  next();
                } else {
                  res.status(401).json({ message: "Invalid token" });
                }
              } else {
                res.status(401).json({
                  message: "You are not authorized to access this page.",
                });
              }
            } else {
              res.status(401).json({ message: "Invalid token" });
            }
          } else {
            res.status(401).json({
              message: "Invalid token",
            });
          }
        }
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { auth, accessRoles };
