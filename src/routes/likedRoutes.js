const express = require('express');
const router = express.Router();

const likedController = require('../controllers/likedController');
const verifyAuth = require('../middleware/verifyAuth');

console.log(typeof verifyAuth);

module.exports = () => {
  router.get('/', verifyAuth.auth, likedController.getLikedItems);

  router.post('/', verifyAuth.auth, likedController.addLikedItem);

  router.delete('/:itemId', verifyAuth.auth, likedController.deleteLikedItem);



  return router;
}
