const config = require('./config');
const debugCors = require('debug')('app:cors');

const whitelist = config.corsAllowedOptions
debugCors(whitelist);

const corsOptions = {
  origin:  (origin, callback) => {
    // whitelisted origin
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    // blocked origin
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


module.exports = corsOptions;