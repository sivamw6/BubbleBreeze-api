const express = require('express');
const router = express.Router();

const ProductPolicy = require('../policies/productPolicy');
const FilePolicy = require('../policies/filePolicy');
const verifyAuth = require('../middleware/verifyAuth');
const ProductController = require('../controllers/productController');
const fileServerUpload = require('../middleware/fileSeverUpload');

module.exports = () => {
  // Get all products
  router.get('/', 
    ProductController.getAllProducts
  );

  // Get onSale products
  router.get('/onSale',
    ProductController.getOnSaleProducts
  );

  // Get products by category
  router.get('/category/:category',
    ProductController.getProductsByCategory
  );

  // Add/Post new product
  router.post('/', 
    [verifyAuth.auth,
    verifyAuth.admin,
      ProductPolicy.validateProduct,
    FilePolicy.filesPayloadExists,
    FilePolicy.fileSizeLimiter,
    FilePolicy.fileExtLimiter(['.png', '.jpg', '.jpeg', '.gif']),
    fileServerUpload],
    ProductController.postProduct
  );


  // Get by id products
  router.get('/:id', 
    ProductController.getProductById
  );

  // Update by id product
  router.put('/:id', 
    [verifyAuth.auth,
      verifyAuth.admin,
    ProductPolicy.validateProduct,
    FilePolicy.filesPayloadExists,
    FilePolicy.fileSizeLimiter,
    FilePolicy.fileExtLimiter(['.png', '.jpg', '.jpeg', '.gif']),
    fileServerUpload],
    ProductController.PutProductById
  );

  // Delete by id product
  router.delete('/:id',
    [verifyAuth.auth,
      verifyAuth.admin],
    ProductController.deleteProductById
  );



  return router
}