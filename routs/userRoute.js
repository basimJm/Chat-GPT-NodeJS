const express = require("express");

const router = express.Router();

const {
  uploadUserImage,
  resizeImage,
  createUser,
  login,
} = require("../services/userService");

//validate
const { createUserValidator } = require("../utils/validator/userValidator");

router
  .route("/signup")
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router.route("/signin").get(login);

module.exports = router;
