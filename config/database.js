const mongoose = require("mongoose");

const dbConnection = () => {
  // Connecet with DB
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Connected to MongoDB"));
};

module.exports = dbConnection;
