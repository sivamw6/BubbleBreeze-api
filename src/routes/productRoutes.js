const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController');

module.exports = () => {
  // Get all products
  router.get('/', 
    ProductController.getAllProducts
  )

  // Get onSale products


  // Add/Post new product


  // Get by id products


  // Update by id product

  // Delete by id product

  return router
}