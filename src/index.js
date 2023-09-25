// Set the instance for the server
const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

// Local imports
const config = require('./config/config');
const routes = require('./routes/routes');
const ApiError = require('./utils/ApiError');
const ApiErrorHandler = require('./middleware/apiErrorHandler');
const { dbPing } = require('./config/db');


// Dev debug console logs
const debugStartup = require('debug')('app:startup');

// Init express app
const app = express(); 

// Express middleware, the order is important
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // morgan is a logger for requests, it will offer more details in the console
debugStartup("Parsing middleware enabled on all routes");

// Establish routes
app.use('/api', routes())

// Error path 1: Not Found Route
app.use((req, res, next) => {
  next(ApiError.notFound());
})

// Error path 2: User/Server Error  
app.use(ApiErrorHandler);

// Port to listen on
dbPing.then(() => {
  const port = config.port;
  app.listen(
    port, 
    () => console.log(`Server started on port: ${port}`)
  );
})