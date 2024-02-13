const { validationResult } = require("express-validator"); // this is middleware validation help us to catch error before start buisnis logic

const validatorMiddleWare = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors });
  }
  next();
};
module.exports = validatorMiddleWare;
