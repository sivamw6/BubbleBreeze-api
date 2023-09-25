module.exports = {
  // PORT ENV
  port: process.env.PORT,


  // Database ENVs
  db: {
    serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    storageBucket: process.env.STORAGE_BUCKET_URL
  }

  // Auth ENVs
}