const { bucket } = require('../config/db');
const config = require('../config/config.js');
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

  },

  async deleteFileFromBucket(uploadedFile){
    debugBucket(`Deleting file ${uploadedFile} from Storage`);
    const file = bucket.file(uploadedFile);
    const fileChecker = await file.exists();

    // [400 ERROR]
    if(fileChecker[0] === false) {
      // TOGGLE: TRUE - ingnore missing files
      const options ={
        ignoreNotFound: true,
      };
      const data = await file.delete(options);
      debugBucket(`File ${uploadedFile} does not exist in Storage - please check server for inconsistent data handling`);
      return data[0];
    } else { 
      const data = await file.delete();
      debugBucket(`File ${uploadedFile} deleted from Storage`);
      return data[0];
    }
  },
  getFileFromUrl(downloadUrl) {
    // Remove front of URL string
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${config.db.storageBucket}/o/`;
    debugBucket(`Base URL: ${baseUrl}`)
    let fileGlob = downloadUrl.replace(baseUrl, "");
  
    // Remove end of URL string
    const indexOfEndPath = fileGlob.indexOf("?");
    fileGlob = fileGlob.substring(0, indexOfEndPath);
    
    // Retun existing file glob
    debugBucket(`File in bucket queued for deletion: ${fileGlob}`);
    return fileGlob;
  }
}