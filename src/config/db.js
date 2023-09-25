var admin = require("firebase-admin");
const dbStartup = require('debug')('app:db')
const debugError500 = require('debug')('app:error500');
const config = require('./config')

try {
  dbStartup("Attempting to connect to the database...");
  var serviceAccount = require(config.db.serviceAccount);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: config.db.storageBucket
  });

  // Connection to the DB is established = can run queries
  dbStartup("Connected to the database");
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  // Test DB connection (only works if you have 1 collection OR more)
  const dbPing = db.listCollections()
  .then(collections => {
    dbStartup("Connected to Cloud Firestore");
    for (let collection of collections) {
      dbStartup(`Found collection: ${collection.id}`);
    }
  })

  // Export these db methods
  module.exports = {
    db,
    bucket,
    dbPing
  }
 
} catch (error) {
  debugError500(error);
}

