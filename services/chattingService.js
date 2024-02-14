const OpenAI = require("openai");

const asyncHandler = require("express-async-handler");

const chattingModel = require("../models/chattingModel");

const userModel = require("../models/userModels");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
dotenv.config({ path: "config.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.createConversationWithGPT = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  const user = await userModel.findById(userID).populate("chatHistory");
  if (!user) {
    return res.status(404).json({ msg: `No user with this id: ${userID}` });
  }

  const { userMessage } = req.body;

  // Construct the messages array from user's chat history
  const messages = user.chatHistory
    .map((chat) => [
      { role: "user", content: chat.userMessage },
      { role: "assistant", content: chat.responseMessage },
    ])
    .flat();

  messages.push({ role: "user", content: userMessage });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const responseMessage = chatCompletion.choices[0].message.content;
  const newChat = { userMessage, responseMessage };

  // Save the new chat to the database
  const chatHistory = await chattingModel.create(newChat);
  user.chatHistory.push(chatHistory);
  await user.save();

  res.status(200).json({ chat: newChat });
});

exports.createConversationWithGPT = asyncHandler(async (req, res) => {
  const { userID, sessionID } = req.params; // Expect sessionID to be passed in
  const user = await userModel.findById(userID).populate({
    path: "sessions",
    populate: {
      path: "chatHistory",
      model: "chats",
    },
  });

  if (!user) {
    return res.status(404).json({ msg: `No user with this id: ${userID}` });
  }

  // Find the specific session or create a new one if sessionID is not provided
  let session;
  if (sessionID) {
    session = user.sessions.find((s) => s._id.toString() === sessionID);
    if (!session) {
      return res
        .status(404)
        .json({ msg: `No session with this id: ${sessionID}` });
    }
  } else {
    // Create a new session
    session = await sessionModel.create({
      sessionName: "New Session",
      chatHistory: [],
    });
    user.sessions.push(session);
    await user.save();
  }

  const { userMessage } = req.body;

  // Append the new user message to the session's messages
  const messages = session.chatHistory
    .map((chat) => [
      { role: "user", content: chat.userMessage },
      { role: "assistant", content: chat.responseMessage },
    ])
    .flat();

  messages.push({ role: "user", content: userMessage });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const responseMessage = chatCompletion.choices[0].message.content;
  const newChat = { userMessage, responseMessage };

  // Save the new chat to the database
  const chatHistory = await chattingModel.create(newChat);
  session.chatHistory.push(chatHistory);
  await session.save();

  res.status(200).json({ chat: newChat });
});
