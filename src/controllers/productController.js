const { db } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { storageBucketUpload, deleteFileFromBucket, getFileFromUrl } = require('../utils/bucketServices');
const debugREAD = require('debug')('app:read');
const debugWRITE = require('debug')('app:write');


module.exports = {

  // [Get all users]
  async getAllProducts(req, res, next) {

    try {
      const productsRef = db.collection('products');
      const snapshot = await productsRef.orderBy("name", "asc").limit(10).get();
      if (snapshot.empty) {
        return next(ApiError.badRequest("No Products!!"));
      }
      let products = [];
      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          image: doc.data().image,
          category: doc.data().category,
          size: doc.data().size,
          texture: doc.data().texture,
          price: doc.data().price,
          onSale: doc.data().onSale,
          isAvailable: doc.data().isAvailable,
        })
      })
      res.send(products);
    } catch (error) {
      return next(ApiError.internal('The products have gone missing', error));
    }
  },

  // [Get onSale products]
  async getOnSaleProducts(req, res, next) {
    try {
      const productsRef = db.collection('products');
      const snapshot = await productsRef.where("onSale", "==", true).orderBy("name", "asc").limit(10).get();
      if (snapshot.empty) {
        return next(ApiError.badRequest("No Products on sale, Sorry!!"));
      } else {
        let products = [];
        snapshot.forEach(doc => {
          products.push({
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            image: doc.data().image,
            category: doc.data().category,
            size: doc.data().size,
            texture: doc.data().texture,
            price: doc.data().price,
            onSale: doc.data().onSale,
            isAvailable: doc.data().isAvailable,
          })
        })
        res.send(products);
      }
    } catch (error) {
      return next(ApiError.internal('The products have gone missing', error));
    }
  },

  // [Get products by category ]
  async getProductsByCategory(req, res, next) {

    const categoryName = req.params.category;
    if(!categoryName) return next(ApiError.badRequest("No category name provided"));
    try {
      const productsRef = db.collection('products');
      const snapshot = await productsRef.where("category", "==", categoryName).orderBy("name", "asc").limit(10).get();
      if (snapshot.empty) {
        return next(ApiError.badRequest("No Products in this category, Sorry!!"));
      } else {
        let products = [];
        snapshot.forEach(doc => {
          products.push({
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            image: doc.data().image,
            category: doc.data().category,
            size: doc.data().size,
            texture: doc.data().texture,
            price: doc.data().price,
            onSale: doc.data().onSale,
            isAvailable: doc.data().isAvailable,
          })
        })
        res.send(products);
      }
    } catch (error) {
      return next(ApiError.internal('The products have gone missing', error));
    }
  },

  // [Post product]
  async postProduct(req, res, next) {
    // (a) Validation (later) & testing data posted by user 
    debugWRITE(req.body);
    debugWRITE(req.files);
    debugWRITE(res.locals);
    // (b) File Upload to Storage Bucket
    let downloadURL = null;
    try {
      const filename = res.locals.filename;
      downloadURL = await storageBucketUpload(filename);
    // [500 ERROR] Checks for Errors in our File Upload
    } catch (error) {
      return next(ApiError.internal('An error occurred in uploading the image to storage', error));
    }
    // (c) Save to Firestore ALL
    try {
      const onSaleBool = req.body.onSale === 'true' ? true : false;
      const isAvailableBool = req.body.isAvailable === 'true' ? true : false;
      const productRef = db.collection('products');
      const response = await productRef.add({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: Number(req.body.price),
        sizes: req.body.sizes,
        texture: req.body.texture,
        onSale: onSaleBool,
        isAvailable: isAvailableBool,
        image: downloadURL
      });
      console.log(`Added Product ID: ${response.id}`);
      res.send(response.id);

    // [500 ERROR] Checks for Errors in our Query - issue with route or DB query
    } catch(err) {
      return next(ApiError.internal('Your request could not be saved at this time', err));
    }
  },


  // [Get product by id]
  async getProductById(req, res, next) {
    debugREAD(req.params.id);
    try {
      const productRef = db.collection('products').doc(req.params.id);
      const doc = await productRef.get();
      if (!doc.exists) {
        return next(ApiError.badRequest("No product found with that ID"));
      }
      res.send(doc.data());
    } catch (error) {
      return next(ApiError.internal('The product has gone missing', error));
    }
  },



  // [Put(update) product by id]
  async PutProductById(req, res, next) {
    // (a) Validation (later) & testing data posted by user 
    debugWRITE(req.params);
    debugWRITE(req.body);
    debugWRITE(req.files);
    debugWRITE(res.locals);
    let downloadURL = null;
    try {
    // (b1) File Upload to Storage Bucket
    if(req.files) {
      // (i) Storage-upload 
      const filename = res.locals.filename;
      downloadURL = await storageBucketUpload(filename);

      // (ii) Storage-delete
      if(req.body.uploadedFile){
        debugWRITE(`Deleting old image in storage: ${req.body.uploadedFile}`);
        const bucketResponse = await deleteFileFromBucket(req.body.uploadedFile);
      }

    // (b2) No File Upload to Storage Bucket
    } else {
      console.log("No change to image in DB")
      downloadURL = req.body.image;
    }


    // [500 ERROR] Checks for Errors in our File Upload
    } catch (error) {
      return next(ApiError.internal('An error occurred in uploading the image to storage', error));
    }
    // (c) Save to Firestore ALL
    try {
      const onSaleBool = req.body.onSale === 'true' ? true : false;
      const isAvailableBool = req.body.isAvailable === 'true' ? true : false;

      const productRef = db.collection('products').doc(req.params.id);
      const response = await productRef.update({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: Number(req.body.price),
        sizes: req.body.sizes,
        texture: req.body.texture,
        onSale: onSaleBool,
        isAvailable: isAvailableBool,
        image: downloadURL
      });
      res.send(response);

    // [500 ERROR] Checks for Errors in our Query - issue with route or DB query
    } catch(err) {
      return next(ApiError.internal('Your request could not be saved at this time', err));
    }

  },


  // [Delete product by id]
  async deleteProductById(req, res, next) {
    try {
      // Request document with matching id = check if it exists
      const productRef = db.collection('products').doc(req.params.id);
      const doc = await productRef.get();

      // [400 ERROR] Check for user asking for non-existent documents
      if (!doc.exists) {
        return next(ApiError.badRequest("No product found with that ID"));
      }
  
      // Store downloadURL and obtain uplodaedFile in storage bucket
      const downloadURL = doc.data().image;
      const uploadedFile = getFileFromUrl(downloadURL);

      // Call storage buucket delete function & delete previous image
      const bucketResponse = await deleteFileFromBucket(uploadedFile);
  
      // Delete document from Cloud Firestore
      if (bucketResponse) {
        // Call DELETE method for ID (with PRECONDITION parameter to check document exists)
        // NOTE: We defined Ref earlier!
        const response = await productRef.delete({exists:true});

        // SUCCESS: Issue back response for timebeing
        res.send(response);
      }
    } catch (error) {
      return next(ApiError.internal('The product has gone missing', error));
    }
  }
  }
