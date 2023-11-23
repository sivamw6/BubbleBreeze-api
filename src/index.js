// Set the instance for the server
const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const cors = require('cors')

// Local imports
const config = require('./config/config')
const ApiError = require('./utils/ApiError')
const ApiErrorHandler = require('./middleware/apiErrorHandler')
const routes = require('./routes/routes')
const { db } = require('./config/db')
const corsOptions = require('./config/corsOptions')
// Dev debug console logs
const debugStartup = require('debug')('app:startup')

// Init express app
const app = express()

// Express middleware, (the order is important)
// HTTP Header-setter security CORS
// app.use(cors({ origin: '*' }))

app.use(helmet())
app.use(cors(corsOptions)) // whitelisting
debugStartup('Helmet & CORS Pre-Flight requests enabled')

// (a) Returns middleware that only parses JSON/urlcoded
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
debugStartup('Parsing middleware enabled on all routes')

// File parsing midleware
app.use(fileUpload({ createParentPath: true }))

// (b) Cycle our request through mogan to track our queries
app.use(morgan('dev')) // morgan is a logger for requests, it will offer more details in the console
// (c) Main routing middleware function
app.get('/', (req, res) => {
  res.send("Welcome to the BB API")
})
app.use('/api', routes())
// (d) Not Found Route
app.use((req, res, next) => {
  next(ApiError.notFound())
})
// (e) Error Handler Middleware
app.use(ApiErrorHandler)

if(config.env === "development") {
  // Test DB connection (only works if you have 1 collection OR more)
  db.listCollections()
    .then(collections => {
      debugStartup('Connected to Cloud Firestore')
      for (const collection of collections) {
        debugStartup(`Found collection: ${collection.id}`)
      }
    })
    app.listen(
      () => console.log(`Server started on port: ${config.port}`)
    )
  } else {
    app.listen(
      () => console.log(`Server started on port: ${config.port}`)
    )
  }


