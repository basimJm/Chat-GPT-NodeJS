const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleWare");

exports.messageValidator = [
  check("originalMessage")
    .isLength({ min: 3 })
    .withMessage("Massege must be of 3 characters long.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Massege must be alphabetic."),
  validatorMiddleware,
];
