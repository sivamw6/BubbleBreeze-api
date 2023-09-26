// Local modules
const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { findUser, hashPassword, userDetailsToJSON, jwtSignUser } = require('../utils/authServices');

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

      // Block duplicate email or username
      const [emailMatch, usernameMatch] = await findUser(email, username);
      
      if(usernameMatch.length > 0){
        return next(ApiError.badRequest("This username is already in use. "))
      }
      if(emailMatch.length > 0){
        return next(ApiError.badRequest("This email is already in use. "))
      }

      // User data can be saved to database
      const usersRef = db.collection('users');
      const response = await usersRef.add({
        firstName: firstName  ,
        lastName: lastName,
        username: username,
        email: email,
        // Encrypt our password
        password: await hashPassword(password),
        isAdmin: false
      })
      console.log(`User added to database:  ${response.id} `)

      // Conver the user details to JSON
      const userJSON = await userDetailsToJSON(response.id);
      
      // Return the user object + token
      res.send({
        user: userJSON,
        // Mint & return the user object + the token WITHOUT the password
        token: jwtSignUser(userJSON)
      })
      
    } catch (error) {
      return next(ApiError.internal("Your profile could not be signed up. Please try again later.", error))
    }



  }

}