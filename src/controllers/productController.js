const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');


module.exports = {
  async getAllProducts(req, res, next) {
    res.send("Test hehehe")
  }
}