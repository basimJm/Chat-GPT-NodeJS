const express = require("express");

const router = express.Router();

const { protect } = require("../services/userService");

const { createConversationWithGPT } = require("../services/chattingService");

router.route("/:userID").post(protect, createConversationWithGPT);

module.exports = router;
