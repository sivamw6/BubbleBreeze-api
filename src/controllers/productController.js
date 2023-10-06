const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');


module.exports = {
  // Get all users
  async getAllProducts(req, res, next) {

    try {
  
      const productsRef = db.collection('products');
      const snapshot = await productsRef.orderBy("name", "asc").limit(10).get();

      if (snapshot.empty) {
        return next(ApiError.badRequest("No Products!!"));
      }
  
      let products = [];
      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          image: doc.data().image,
          category: doc.data().category,
          size: doc.data().size,
          texture: doc.data().texture,
          price: doc.data().price,
          onSale: doc.data().onSale,
          isAvailable: doc.data().isAvailable,
        })
      })
  
      res.send(products);
      


    } catch (error) {
      return next(ApiError.internal('The products have gone missing', error));
    }
  },

}