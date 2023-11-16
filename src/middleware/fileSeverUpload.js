// Role: Upload the request file to /uploads folder on the server
const ApiError = require('../utils/ApiError')
const debugWRITE = require('debug')('app:write')
const path = require('path')

const fileServerUpload = async (req, res, next) => {
  // Check if the file has been uploaded
  if (req.files) {
    // 1. Store the file in local variable
    const file = req.files.image
    debugWRITE(`Image for server processing: ${file.name}`)

    // 2. Append unique file ID
    const filename = Date.now() + '_' + file.name
    debugWRITE(`Unique Filename: ${filename}`)

    // 3. Declare server storage directory path
    const uploadPath = path.join(
      __dirname,
      '../../public/uploads/',
      filename
    )

    // 4. Move the file to the server storage directory
    file
      .mv(uploadPath)
      .then(() => {
      // 5. Set filename variable on req object & pass to next middleware
        console.log(`Server Upload Successful: ${uploadPath}`)
        res.locals.filename = filename
        next()
      })
      .catch(err => {
        if (err) return next(ApiError.internal('Your file request could not be pocessed at this time', err))
      })
  } else {
    next()
  }
}

module.exports = fileServerUpload
