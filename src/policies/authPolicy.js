const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const debugJoi = require('debug')('app:joi');

module.exports = {
  validateAuth(req, res, next){
    // 1. Set the Joi schema
    debugJoi(req.body);
    const schema = Joi.object({
      firstName: Joi.string().alphanum().min(3).max(30),
      lastName: Joi.string().alphanum().min(3).max(30),
      username: Joi.string().alphanum().min(3).max(30),
      email: Joi.string().email({ minDomainSegments:2, tlds: {allow: ['com', 'net']}}),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()

    }).or('username', 'email');
    
  
    // 2. Call the Joi validate method on req.body
    const { error, value } = schema.validate(req.body)
  

    // 3. In the event of ERROR, test the type of error
    if (error) {
      debugJoi(error);
    
      // Check if both username and email are not provided
      const inputKeys = Object.keys(req.body);
      if (!inputKeys.includes('username') && !inputKeys.includes('email')) {
        return next(ApiError.badRequest('You must provide either a username or email to login'));
      }
    
      // Handle other errors
      switch(error.details[0].context.key) {
        case 'firstName':
          next(ApiError.badRequest('You must provide a valid first name'));
          break;
        case 'lastName':
          next(ApiError.badRequest('You must provide a valid last name'));
          break;  
        case 'username':
          next(ApiError.badRequest('You must provide a valid username'));
          break;
        case 'email':
          next(ApiError.badRequest('You must provide a valid email'));
          break;
        case 'password':
          next(ApiError.badRequest('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number length 3-30 characters'));
          break;
        default:
          next(ApiError.badRequest('Invalid registration information'));
          break;
      }
    } else {
      next();
    }
    
    }
  }
