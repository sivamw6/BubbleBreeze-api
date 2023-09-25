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
      return next(ApiError.badRequest('The users you were looking for do not exist'));
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
  }
}