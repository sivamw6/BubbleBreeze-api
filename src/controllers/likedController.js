// likedController.js
const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');

module.exports = {
  // [(GET) Get all liked items]
  async getLikedItems(req, res, next) {
    try {
      const userId = req.user.id; 
      const likedRef = db.collection('liked');
      const snapshot = await likedRef.where("userId", "==", userId).get();

      if (snapshot.empty) {
        return next(ApiError.badRequest("You haven't liked any products yet."));
      }

      let likedItems = [];
      snapshot.forEach(doc => {
        likedItems.push(doc.data());
      });

      res.send(likedItems);
    } catch (error) {
      return next(ApiError.internal("Error fetching liked items", error));
    }
  },

  // [(POST) Add or Remove a liked item]
async toggleLikedItem(req, res, next) {
  try {
    const userId = req.user.id; 
    const { productId } = req.body; 

    const likedRef = db.collection('liked');
    const querySnapshot = await likedRef
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0];
      await likedRef.doc(docRef.id).delete();
      res.status(200).send({ success: true, message: 'Liked item has been removed.' });
    } else {
      const response = await likedRef.add({
        userId,
        productId,
        createdAt: new Date()
      });
      res.status(201).send({ likedId: response.id, message: 'Liked item has been added.' });
    }
  } catch (error) {
    return next(ApiError.internal("Error toggling liked item", error));
  }
}


};
