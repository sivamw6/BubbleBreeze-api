const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const debugJwt = require('debug')('app:jwt');

// Check if the user is logged in
const auth = (req, res, next) => {
  // Load bearer token from the header
  let token = req.header('Authorization');

  // 401 Error: Token has not been passed with header
  if(!token) {return next(ApiError.denyAccess('No token provided'))
  } else {
    token = token.substring(7, token.length);
    debugJwt(`Token: ${token}`);
  }

  // Test weather token is valid
  try {
    const decoded = jwt.verify(token, config.authentication.jwtSecret);
    req.user = decoded;
    debugJwt(`User credentials verified:: ${req.user.username}`);
    next();
  // [401 Error]: Catch invalid token "exception"
  } catch (ex) {
    debugJwt(ex);
    return next(ApiError.denyAccess('Invalid token'));
  }
}

// Check if the user has admin privileges
const admin = (req, res, next) => {
  // 403 ERROR: FORBIDDEN
  // NOTE: Has access to req.user, as auth.js middleware exposes this data to subsequent middleware
  if (!req.user.isAdmin) {
    debugJwt(req.user);
    return next(ApiError.forbidden("Insufficient permissions"));
  }
  debugJwt(`Administrative access granted: ${req.user.isAdmin}`)
  next();
}
const verifyAuth = {
  auth,
  admin
}

module.exports = verifyAuth;