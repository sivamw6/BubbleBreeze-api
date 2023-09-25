// External modules
const bcrypt = require('bcrypt'); 
const _ = require('lodash'); 
const jwt = require('jsonwebtoken');

// Local modules
const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');

module.exports = {
  // [1] GET ALL Users
  async listUsers(req, res, next){
    // Store the document query in variable & call GET method
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();


    // [400 ERROR] Check for User Asking for Non-Existent Documents
    if (snapshot.empty) {
      return next(ApiError.badRequest("The users you were looking for do not exist"));
    }

    // SUCCESS: Push object properties to array and send to client
    let users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        username: doc.data().username,
        email: doc.data().email,
        isAdmin: doc.data().isAdmin
      });
    });
    res.send(users);
  },


  // [2] POST New User
  async signup(req, res, next){
    try {
      const { firstName, lastName, username, email, password } = req.body;
      
      // Block matching emails in database 
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
      const emailMatch = users.filter(user => user.email === email);
      const usernameMatch = users.filter(user => user.username === username);
      if(usernameMatch.length === 1){
        return next(ApiError.badRequest("This username is already in use. "))
      }
      if(emailMatch.length === 1){
        return next(ApiError.badRequest("This email is already in use. "))
      }


      // Encrypt our password
      const salt = await bcrypt.genSalt(15);
      const hashPassword = await bcrypt.hash(password, salt);


      // User data can be saved to database
      const response = await usersRef.add({
        firstName: firstName  ,
        lastName: lastName,
        username: username,
        email: email,
        password: hashPassword,
        isAdmin: false
      })
      console.log(`User added to database:  ${response.id} `)


      // Conver the user details to JSON
      const user = await usersRef.doc(response.id).get();
      const userJSON = _.omit(
        { id: response.id, ...user.data() },
        'password'// second argument is the property we want to remove
      ) 
      // Mint & return the user object + the token WITHOUT the password
      const payload = userJSON;
      const secrect = "password";
      const tokenExpireTime = 60 * 60 * 24; 
      
      const token = jwt.sign(payload, secrect, { expiresIn: tokenExpireTime });

      // Return the user object + token
      res.send({
        user: userJSON,
        token: token
      })
      
    } catch (error) {
      return next(ApiError.internal("Your profile could not be signed up. Please try again later.", error))
    }



  }

}