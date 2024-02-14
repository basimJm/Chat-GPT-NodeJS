const mongoose = require("mongoose");

const chattingSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true,
  },

  responseMessage: {
    type: String,
  },
});

module.exports = mongoose.model("chats", chattingSchema);
