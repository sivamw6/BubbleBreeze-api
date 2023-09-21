const express = require('express');
const router = express.Router();

module.exports = () => {
  router.get('/', (req, res, next) => {
    res.send('Welcome to Bubble Breeze API');
  })

  return router;
} 