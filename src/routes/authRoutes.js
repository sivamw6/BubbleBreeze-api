const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');

module.exports = () => {
  // Endpoint: /api/auth/users
  router.get('/users', 
    AuthController.listUsers
    )
    return router;
}