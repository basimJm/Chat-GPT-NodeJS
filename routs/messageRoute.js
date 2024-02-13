const express = require("express");

const router = express.Router();

const {
  sendMessage,
  sendFreeTrailMessage,
} = require("../services/messageService");
const { protect } = require("../services/userService");
const { freeTrail } = require("../middleware/limiterMiddleware");
const { messageValidator } = require("../utils/validator/messageValidator");

router.route("/:userID").post(protect, messageValidator, sendMessage);

router.route("/").post(messageValidator, freeTrail, sendFreeTrailMessage);

module.exports = router;
