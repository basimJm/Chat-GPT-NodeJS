const express = require("express");
const dotenv = require("dotenv");
const PORT = process.env.PORT || 6000;
const morgan = require("morgan");
const path = require("path");
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");

// import routs
const userRoute = require("./routs/userRoute");
const messageRoute = require("./routs/messageRoute");
const sessionRoute = require("./routs/sessionRouts");
const chatHistory = require("./routs/chattingRoute");

//get middleware path
dotenv.config({ path: "config.env" });

//connect with db
dbConnection();

//express app
const app = express();

//to get static folder
app.use(express.static(path.join(__dirname, "uploads")));

//middleWare

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode is ${process.env.NODE_ENV}`);
}
//inside middelWare parse json
app.use(express.json());

//for deploy
app.set("trust proxy", true);

app.use("/api/v1/text-correction", userRoute, messageRoute);
app.use("/api/v1/session/", sessionRoute);
app.use("/api/v1/chat-history", chatHistory);

//Handle unhandled route
app.all("*", (req, res, next) => {
  //   const err = new Error(`cant fing this route ${req.originalUrl}`);
  //  next(err.message); // this next will send the error to global error handle middleWare
  next(new ApiError(`cant fing this route ${req.originalUrl}`, 400)); // this next will send the error to global error handle middleWare
});

//Global error handiling middleware for express
app.use(globalError);

// check port
const server = app.listen(PORT, () => {
  console.log(`app running on port : ${PORT}`);
});

//Events => Listener => callback(err) when show any error out of express make event we just want to make listener for this error and send it with call back to catch it
process.on("unhandledRejection", (err) => {
  console.error(`UnHandled Error: ${err}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
