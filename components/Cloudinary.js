const cloudinary = require('cloudinary').v2;

class Cloudinary {
  static async upload(file, path) {
    return await cloudinary.uploader.upload(file, {
      use_filename: true,
      folder: path,
    });
  }

  static async delete(file) {
    return await cloudinary.uploader.destroy(file);
  }
}

module.exports = Cloudinary;
