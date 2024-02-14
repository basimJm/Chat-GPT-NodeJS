const OpenAI = require("openai");

const asyncHandler = require("express-async-handler");

const chattingModel = require("../models/chattingModel");

const userModel = require("../models/userModels");

const sessionModel = require("../models/sessionModel");

const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
dotenv.config({ path: "config.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.craeteSession = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  const { sessionName } = req.body;
  const user = await userModel.findById(userID);
  if (!user) {
    return res.status(404).json({ msg: `No user with this id: ${userID}` });
  }

  const session = await sessionModel.create({
    sessionName: sessionName,
    chatHistory: [],
  });
  user.sessions.push(session);
  await user.save();

  res.status(200).json({ status: 201, session: session });
});

exports.sessionChatting = asyncHandler(async (req, res) => {
  const { userID, sessionID } = req.params;
  const session = await sessionModel
    .findById(sessionID)
    .populate("chatHistory");

  const user = await userModel.findById(userID);

  if (!session) {
    return res.status(404).json({ msg: `this session not found ` });
  }
  if (!user) {
    return res.status(404).json({ msg: `this user not found ` });
  }

  const messages = session.chatHistory
    .map((chat) => [
      { role: "user", content: chat.userMessage },
      { role: "assistant", content: chat.responseMessage },
    ])
    .flat();
  const { userMessage } = req.body;
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
  res.status(200).json({
    status: 200,
    session: session._doc.sessionName,
    data: chatHistory,
  });

  //   const user = await userModel.findById(userID).populate({
  //     path: "sessions",
  //     populate: {
  //       path: "chatHistory",
  //       model: "chats",
  //     },
  //   });

  //   if (!user) {
  //     return res.status(404).json({ msg: `No user with this id: ${userID}` });
  //   }
  //   if (!sessionID) {
  //     return res
  //       .status(404)
  //       .json({ msg: `No sessionwith this id: ${sessionID}` });
  //   }

  //   const session = await user.sessions.findById(sessionID);
  //   const { userMessage } = req.body;

  //   const messages = session.chatHistory
  //     .map((chat) => [
  //       { role: "user", content: chat.userMessage },
  //       { role: "assistant", content: chat.responseMessage },
  //     ])
  //     .flat();

  //   messages.push({ role: "user", content: userMessage });

  //   const chatCompletion = await openai.chat.completions.create({
  //     model: "gpt-3.5-turbo",
  //     messages: messages,
  //   });

  //   const responseMessage = chatCompletion.choices[0].message.content;
  //   const newChat = { userMessage, responseMessage };

  //   // Save the new chat to the database
  //   const chatHistory = await chattingModel.create(newChat);
  //   session.chatHistory.push(chatHistory);
  //   await session.save();

  //   res.status(200).json({ chat: newChat });
});
