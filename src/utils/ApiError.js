class ApiError {
  constructor(code, message, err){
    this.code = code;
    this.message = message;
    this.err = err;
  }

  // [400] Bad Request
  static badRequest(msg){
    return new ApiError(400, `Bad Request: ${msg}`);
  }

  // [404] Not Found
  static notFound(){
    return new ApiError(404, "Resource Not Found");
  }

  // [413] Entity Too Large
  static tooLarge(msg){
    return new ApiError(413, `Upload Failed: ${msg}`);
  }

  // [422] Unporcessable Entity
  static cannotProcess(msg){
    return new ApiError(422, `Unprocessable Entity: ${msg}`);
  }

  // [500] Internal Server Error
  static internal(msg, err){
    console.log(err);
    return new ApiError(500, `Internal Server Error: ${msg}`);
  }
}

module.exports = ApiError;