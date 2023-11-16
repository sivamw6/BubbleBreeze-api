const express = require('express')
const router = express.Router()

const authRoutues = require('./authRoutes')
const productRoutes = require('./productRoutes')
const likedRoutes = require('./likedRoutes')

module.exports = () => {
  // Test GET Route
  router.get('/', (req, res, next) => {
    res.send('Welcome to Bubble Breeze API')
  })

  // Sub-Routes
  // auth: http://localhost:3000/api/auth
  router.use('/auth', authRoutues())

  // product: http://localhost:3000/api/products
  router.use('/products', productRoutes())

  // liked: http://localhost:3000/api/liked
  router.use('/liked', likedRoutes())

  return router
}
