const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    errorReposneMessage: err.message,
    stack: err.stack,
  }); // send error in details
};

const sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    errorReposneMessage: err.message,
    error: err,
  }); // send error in details
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error"; // status in utils apiError class  was eather fail or error
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
    // sendErrorForProd(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
