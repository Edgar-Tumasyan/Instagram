const cloudinary = require('cloudinary').v2;

class Cloudinary {
  static async upload(file, path) {
    const attachment = await cloudinary.uploader.upload(file, {
      use_filename: true,
      folder: path,
    });

    return attachment;
  }

  static async delete(file) {
    await cloudinary.uploader.destroy(file);
  }
}

module.exports = Cloudinary;
