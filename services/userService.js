const asyncHandler = require("express-async-handler");

const sharp = require("sharp");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const userModel = require("../models/userModels");

const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/apiError");

const createToken = require("../utils/createToken");

const { uploadSingleImage } = require("../middleware/uploadFilesMiddleware");

// Upload single image
exports.uploadUserImage = uploadSingleImage("uploads");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("png")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

//createUser
exports.createUser = asyncHandler(async (req, res, next) => {
  //   if (!req.file) {
  //     return next(new ApiError("wrong file path ", 404));
  //   }
  const { name, email, phone, password } = req.body;
  const profileImage = `uploads/users/${req.body.profileImg}`;
  const userData = userModel({
    name,
    email,
    phone,
    profileImage,
    password,
  });

  const saveUser = await userData.save();
  const token = createToken(saveUser._id);

  res.status(201).json({ status: 201, data: saveUser, token: token });
});

//sign in with GET Method
exports.login = asyncHandler(async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.body.email })
    .populate({ path: "messages" })
    .populate({
      path: "sessions",
      populate: { path: "chatHistory", model: "chats" },
    }); //, select: "date , type , reading-_id"

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("invalid email or password", 401));
  }
  const token = createToken(user._id);

  //delete password from resaponse
  delete user._doc.password;
  res.status(200).json({ status: 200, user: user, token: token });
});

/**
 * this function to get user inn splash screen in mobile application
 */
exports.validToken = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await userModel.findById(decoded.id);

  if (!user) {
    return next(new ApiError("Invalid Token! Please Login Again.", 401));
  }

  res.status(200).json({ json: user });
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }
  const userId = req.params.userID;

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //3)  Check if user exists
  const currentUser = await userModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  // 5)check if this token for this userID
  if (userId.toString() !== currentUser._id.toString()) {
    return next(new ApiError("Invalid Token For User", 401));
  }

  req.user = currentUser;
  next();
});
