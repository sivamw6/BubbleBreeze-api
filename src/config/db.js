const admin = require('firebase-admin')
const dbStartup = require('debug')('app:db')
const debugError500 = require('debug')('app:error500')
const config = require('./config')

try {
  dbStartup('Attempting to connect to the database...')
  // Set up of db credentials & options
  let serviceAccountKey;
  // Standard setup: env key
  if(config.env === "development" || config.env === "production") {
    serviceAccountKey = config.db.google_account_credentials;
    // NEW setup: seperate ENVs
  }else if (config.env === "preview") {
    // https://firebase.google.com/docs/reference/admin/node/firebase-admin.app
    serviceAccountKey = {
      type: config.db.type,
      project_id: config.db.project_id,
      private_key_id: config.db.private_key_id,
      private_key: config.db.private_key,
      client_email: config.db.client_email,
      client_id: config.db.client_id,
      auth_uri: config.db.auth_uri,
      token_uri: config.db.token_uri,
      auth_provider_x509_cert_url: config.db.auth_provider_x509_cert_url,
      client_x509_cert_url: config.db.client_x509_cert_url,
      universe_domain: config.db.universe_domain,
    };
  }
  dbStartup(serviceAccountKey);

  // OPTIONS VAR: Grant admin access to firebase servives + bucket services
  const firebaseAppOptions ={
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket: config.db.storageBucket
  }

  // Init firebase services & set core database APIs
  admin.initializeApp(firebaseAppOptions)
  const db = admin.firestore()
  const bucket = admin.storage().bucket()


  // Export these db methods
  module.exports = {
    db,
    bucket
  }
} catch (error) {
  debugError500(error)
}
