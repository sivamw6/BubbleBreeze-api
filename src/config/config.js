module.exports = {
  // PORT ENV
  port: process.env.PORT,


  // Database ENVs
  db: {
    serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    storageBucket: process.env.STORAGE_BUCKET_URL
  },

  // Auth ENVs
  authentication: {
    jwtSecret: process.env.JWT_SECRET,
  }, 

  // CORS whitelist
  corsAllowedOptions: [
    process.env.CORS_WHITELIST_1,
    process.env.CORS_WHITELIST_2,
  ]
}