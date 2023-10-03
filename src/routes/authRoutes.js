const express = require('express');
const router = express.Router();

const AuthPolicy = require('../policies/authPolicy');
const AuthController = require('../controllers/authController');

module.exports = () => {
  // Auth: test rroute for list of users - GET /api/auth/users
  router.get('/users', 
    AuthController.listUsers
    )

  // Auth register: New user sign up - POST /api/auth/signup
  router.post('/signup',
    AuthPolicy.validateAuth,
    AuthController.signup
  )


  // Auth login: Existing user login - POST /api/auth/login
  router.post('/login',
    AuthPolicy.validateAuth,
    AuthController.login
  )

    return router;
}