const asyncHandler = require("express-async-handler");

const axios = require("axios");

const messageModel = require("../models/messageModel");
const userModel = require("../models/userModels");

async function sendMessageToChatGPT(message) {
  const url = process.env.OPENAI_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await axios.post(
    url,
    {
      model: "gpt-3.5-turbo", // chat gpt mode
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

exports.sendMessage = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  const user = await userModel.findById(userID);
  if (!user) {
    res.status(404).json({ msg: `no user with this id :${userID}` });
  }

  const { originalMessage, dialect, tone } = req.body;

  const correctedMessage = await sendMessageToChatGPT(
    `,  In dialect :${dialect} ,  in tone : ${tone} , please correct this text : ${originalMessage}`
  );
  const messageData = {
    originalMessage,
    correctedMessage,
  };
  const message = await messageModel.create(messageData);
  user.messages.push(message);
  await user.save();

  res.status(200).json({
    status: 200,
    correctedMessage: message.correctedMessage,
    originalMessage: message.originalMessage,
  });
});

exports.sendFreeTrailMessage = asyncHandler(async (req, res) => {
  const { originalMessage, dialect, tone } = req.body;

  const correctedMessage = await sendMessageToChatGPT(
    `,  In dialect :${dialect} ,  in tone : ${tone} , please correct this text : ${originalMessage}`
  );
  const messageData = {
    originalMessage,
    correctedMessage,
  };
  const message = await messageModel.create(messageData);

  res.status(200).json({
    status: 200,
    correctedMessage: message.correctedMessage,
    originalMessage: message.originalMessage,
  });
});
