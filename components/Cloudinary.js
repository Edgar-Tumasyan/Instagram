const config = require('../config');
const cloudinary = require('cloudinary').v2;

cloudinary.config(config.cloudinary);

class Cloudinary {
    static async upload(file, path) {
        return await cloudinary.uploader.upload(file, {
            use_filename: true,
            folder: path
        });
    }

    static async delete(file) {
        await cloudinary.uploader.destroy(file);
    }
}

module.exports = Cloudinary;
