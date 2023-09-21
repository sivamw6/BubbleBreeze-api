const ApiError = require('../utils/ApiError');

function apiErrorHandler(err, req,res, next){
  // Recognize the error
  if(err instanceof ApiError){
    res.status(err.code).json(err.message);
    return;
  // Unknown error
  } else {
    console.error(err);
    res.status(500).json(
      {message: "Oops, something went wrong on our side. Please try again later."}
    );
    return;
  }
}

module.exports = apiErrorHandler;