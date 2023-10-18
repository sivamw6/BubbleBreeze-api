const express = require('express');
const router = express.Router();

const ProductPolicy = require('../policies/productPolicy');
const FilePolicy = require('../policies/filePolicy');
const ProductController = require('../controllers/productController');
const fileServerUpload = require('../middleware/fileSeverUpload');

module.exports = () => {
  // Get all products
  router.get('/', 
    ProductController.getAllProducts
  );

  // Get onSale products


  // Add/Post new product
  router.post('/', 
    [ProductPolicy.validateProduct,
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


  // Delete by id product


  return router
}