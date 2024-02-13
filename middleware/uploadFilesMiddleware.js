const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

// const multer = require("multer");
// const path = require("path");

// const sharp = require("sharp");

// // Create the uploads directory if it doesn't exist
// const uploadDir = path.join(__dirname, "../../uploads");

// const fs = require("fs");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// exports.upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, callback) {
//     const ext = path.extname(file.originalname);
//     if (
//       ext !== ".png" &&
//       ext !== ".jpg" &&
//       ext !== ".gif" &&
//       ext !== ".jpeg" &&
//       ext !== ".pdf"
//     ) {
//       return callback(new Error("Only images are allowed"));
//     }
//     callback(null, true);
//   },
//   limits: {
//     fileSize: 1024 * 1024,
//   },
// });

// exports.resizeImage = (req, res, next) => {
//   if (!req.file) {
//     return next(new Error("No file found"));
//   }

//   const imagePath = req.file.path;
//   const outputPath = path.join(uploadDir, ` resized_ ${req.file.filename}`);

//   sharp(imagePath)
//     .resize(800, 800)
//     .toFile(outputPath, (err) => {
//       if (err) {
//         return next(err);
//       }

//       req.resizedImagePath = outputPath;
//       next();
//     });
// };
