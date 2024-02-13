const limiter = require("express-rate-limit");

exports.freeTrail = limiter({
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});
