const os = require('os');
const sharp = require('sharp');

const resizeImage = async file => {
    const filePath = `${os.tmpdir()}\\${file.key}`;

    await sharp(file.path).rotate().resize(200, 200).jpeg({ mozjpeg: true }).toFile(filePath);

    return filePath;
};

module.exports = resizeImage;
