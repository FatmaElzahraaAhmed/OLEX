const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileExtensions = {
  image: ["image/png", "image/jpeg", "image/gif", "image/jpg"],
  file: ["application/pdf"],
};

const HME=(err,req,res,next)=>{
    if(err){
        res.status(400).json({message:err.message});
    }else{
        next()
    }
}

function uploadData(customPath, fileExtensions) {
   
  if (!customPath || customPath == "") {
    customPath = "generalData";
  }
  
  if (!fs.existsSync(path.join(__dirname, `../uploads/${customPath}`))) {
    fs.mkdirSync(path.join(__dirname, `../uploads/${customPath}`), {
      recursive: true,
    });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../uploads/${customPath}`));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + file.originalname;
      req.fileURL = `uploads/${customPath}`;
      cb(null, uniqueSuffix);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (fileExtensions.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileUploadError = true;
      cb(null, false);
    }
  };
  if(customPath=="images/coverPics")
  {
      const upload = multer({
        dest: path.join(__dirname, `../uploads/${customPath}`),
        limits:{files:5},
        fileFilter,
        storage,
      });
      return upload;
  }else if(customPath=="images/profilePic"){
    const upload = multer({
        dest: path.join(__dirname, `../uploads/${customPath}`),
        limits:{files:2},
        fileFilter,
        storage,
      });
      return upload;
  }
  
}

module.exports = { uploadData, fileExtensions,HME };
