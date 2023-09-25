const express = require('express');
const router = express.Router();

const authRoutues = require('./authRoutes');

module.exports = () => {
  // Test GET Route
  router.get('/', (req, res, next) => {
    res.send('Welcome to Bubble Breeze API');
  });

  // Sub-Routes
  router.use('/auth', authRoutues());

  return router;
} 