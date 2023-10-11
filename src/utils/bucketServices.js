const { bucket } = require('../config/db');
const debugBucket = require('debug')('app:bucket');
const uuid = require('uuid');
const fs = require('fs');

module.exports = {
  async storageBucketUpload(filename) {
    // 1. Generate a random uuid storage token
    debugBucket(`Firestore Filename: ${filename}`);
    const storageToken = uuid.v4();

    // 2. Declare filepath & options parameters for bucket upload
    const serverFilePath = `./public/uploads/${filename}`;
    const options = {
      destination: filename,
      resumable: true,
      validation: 'crc32c',
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: storageToken 
        },
      }
    };

    // OPTIONAL DEBUGGING: Checks if server-side /uploads file exists before BUCKET UPLOAD
    fs.access(serverFilePath, fs.F_OK, (err) => {
      if (err) {
        debugBucket(err);
        return({
          message: 'Error occurred in storing file to server'
        });
      } else {
        debugBucket("File Successfully Stored in Server");
      }
    });

    // 3. Cloud Firebase upload call
    const result = await bucket.upload(serverFilePath, options);
    const bucketName = result[0].metadata.bucket;
    debugBucket(`Bucket Name: ${bucketName}`);

    // 4. Construct download URL
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${filename}?alt=media&token=${storageToken}`;
    console.log(`File Successfully Uploaded to Storage Bucket: ${downloadURL}`);

    // 5. Delete temporary file in server-side uploads
    fs.unlink(serverFilePath, err => {
      if(err) {
        debugBucket(err);
        return({
          message: 'Error occurred in removing file from temporary local storage'
        });
      } else {
        debugBucket('File in temporary local storage deleted');
      }
    });

    return downloadURL

  }
}