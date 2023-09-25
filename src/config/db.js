var admin = require("firebase-admin");
const dbStartup = require('debug')('app:db')
const debugError500 = require('debug')('app:error500');

try {
  dbStartup("Connecting to the database...");
  var serviceAccount = require("/Users/Mavis/Documents/Holmesglen/firebase/bb-app-service-account-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://bb-app-b64be.appspot.com"
  });

  // Connection to the DB is established = can run queries
  dbStartup("Connected to the database");
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  // Export these db methods
  module.exports = {
    db,
    bucket
  }

} catch (error) {
  debugError500(error);
}

