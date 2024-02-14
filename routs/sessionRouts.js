const express = require("express");

const router = express.Router();

const { protect } = require("../services/userService");
const {
  sessionChatting,
  craeteSession,
} = require("../services/sessionService");

router.route("/:userID/:sessionID").post(sessionChatting);
router.route("/:userID").post(protect, craeteSession);

module.exports = router;
