const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: true,
    },
    chatHistory: [{ type: mongoose.Schema.ObjectId, ref: "chats" }],
  },
  { timestamps: true }
);
const sessionModel = mongoose.model("session", sessionSchema);
module.exports = sessionModel;
