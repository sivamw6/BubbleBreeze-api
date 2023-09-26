// Local modules
const { db } = require('../config/db');
const config = require('../config/config');
const debugAuth = require('debug')('app:authServices');

// External modules
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const _ = require('lodash'); 

module.exports = {
  async findUser(email, username) {

    // Convert email & username to lowercase
    email = email.toLowerCase();
    username = username.toLowerCase();

    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    // SUCCESS: Push object properties to array and send to client
    let users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        username: doc.data().username,
        email: doc.data().email,
        password: doc.data().password,
        isAdmin: doc.data().isAdmin
      });
    });

    // Search the users array for a duplicate
    const usernameMatch = users.filter(user => user.username.toLowerCase() === username);
    const emailMatch = users.filter(user => user.email.toLowerCase() === email);

    return [ emailMatch, usernameMatch] ;
  },

  // Encrypt our password
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(15);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  },

  // Convert user details to JSON
  async userDetailsToJSON(id){
    const usersRef = db.collection('users');

    const user = await usersRef.doc(id).get();
    const userJSON = _.omit(
      { id: id, ...user.data() },
      'password'// second argument is the property we want to remove
    );
    debugAuth(userJSON);
    return userJSON;   
  },

  // Mint & return the user object + the token WITHOUT the password
  jwtSignUser(user){
    const payload = user;
    const secrect = config.authentication.jwtSecret;
    const tokenExpireTime = 60 * 60 * 24; 
    
    const token = jwt.sign(payload, secrect, { expiresIn: tokenExpireTime });
    return token;
  }
}