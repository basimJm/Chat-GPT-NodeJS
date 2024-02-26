const express = require("express");

const router = express.Router();

const {
  uploadUserImage,
  resizeImage,
  createUser,
  login,
  validToken,
  protect,
} = require("../services/userService");

//validate
const { createUserValidator } = require("../utils/validator/userValidator");

router
  .route("/signup")
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router.route("/signin").post(login);

router.route("/validToken").get(validToken);

module.exports = router;
