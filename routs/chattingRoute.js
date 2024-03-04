const express = require("express");

const router = express.Router();

const { protect } = require("../services/userService");

const {
  createConversationWithGPT,
  getUserChats,
} = require("../services/chattingService");

// router.route("/:userID").post(protect, createConversationWithGPT);
router.route("/:userID/:sessionID").get(getUserChats);

module.exports = router;
