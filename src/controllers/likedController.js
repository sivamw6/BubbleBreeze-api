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

  // [(POST) Add a liked item]
  async addLikedItem(req, res, next) {
    try {
      const userId = req.user.id; 
      const { productId } = req.body; 

      const likedRef = db.collection('liked');
      const response = await likedRef.add({
        userId,
        productId,
        createdAt: new Date()
      });

      res.status(201).send({ likedId: response.id });
    } catch (error) {
      return next(ApiError.internal("Error adding liked item", error));
    }
  },

  // [(DELETE) Remove a liked item]
  async deleteLikedItem(req, res, next) {
    try {
      const userId = req.user.id; 
      const { likedId } = req.params;

      const likedRef = db.collection('liked').doc(likedId);
      const doc = await likedRef.get();

      if (!doc.exists || doc.data().userId !== userId) {
        return next(ApiError.badRequest("Liked item not found or user mismatch."));
      }

      await likedRef.delete();
      res.status(200).send({ success: true, message: 'Liked item has been removed.' });
    } catch (error) {
      return next(ApiError.internal("Error removing liked item", error));
    }
  },
};
