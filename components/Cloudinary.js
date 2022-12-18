const cloudinary = require('cloudinary').v2;

const config = require('../config');
const resizeImage = require('./resizeImage');

cloudinary.config(config.cloudinary);

class Cloudinary {
    static async upload(file, path) {
        const filePath = await resizeImage(file);

        return await cloudinary.uploader.upload(filePath, { use_filename: true, folder: path });
    }

    static async delete(file) {
        await cloudinary.uploader.destroy(file);
    }
}

module.exports = Cloudinary;
