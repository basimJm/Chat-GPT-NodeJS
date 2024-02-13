const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    originalMessage: {
      type: String,
      required: true,
    },
    dialect: {
      type: String,

      enum: ["US", "UK", "Canada"],
      default: "US",
    },
    tone: {
      type: String,

      enum: ["Friendly", "General"],
      default: "General",
    },
    correctedMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", MessageSchema);
