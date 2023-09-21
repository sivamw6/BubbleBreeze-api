// Set the instance for the server
const express = require('express');
const morgan = require('morgan');

// Local imports
const routes = require('./routes/routes');
const ApiError = require('./utils/ApiError');
const ApiErrorHandler = require('./middleware/apiErrorHandler');

// Init express app
const app = express(); 

// Express middleware, the order is important
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // morgan is a logger for requests, it will offer more details in the console

// Establish routes
app.use('/api', routes())

// Error path 1: Not Found Route
app.use((req, res, next) => {
  next(ApiError.notFound());
})

// Error path 2: User/Server Error  
app.use(ApiErrorHandler);

// Port to listen on
const PORT = process.env.PORT || 3000;
app.listen(
  PORT, 
  () => console.log(`Server started on port: ${PORT}`)
);