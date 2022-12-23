const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');

const { ExportParam } = require('../constants');
const config = require('../config');

class ExportNormalizer {
    static async user(data) {
        const { USER } = ExportParam;
        const result = [];

        if (_.isUndefined(...data)) {
            const fields = {};

            for (const value of Object.values(USER)) {
                fields[value] = null;
            }

            result.push(fields);

            return result;
        }

        data.forEach(user => {
            user.createdAt = user.createdAt.toLocaleDateString();
            user.status = user.status.charAt(0).toUpperCase() + user.status.slice(1);

            result.push({
                [USER.firstname]: user.firstname,
                [USER.lastname]: user.lastname,
                [USER.email]: user.email,
                [USER.createdAt]: user.createdAt,
                [USER.status]: user.status,
                [USER.postsCount]: user.postsCount,
                [USER.followersCount]: user.followersCount,
                [USER.followingsCount]: user.followingsCount
            });
        });

        return result;
    }

    static async post(data) {
        const { POST } = ExportParam;
        const result = [];

        if (_.isUndefined(...data)) {
            const fields = {};

            for (const value of Object.values(POST)) {
                fields[value] = null;
            }

            result.push(fields);

            return result;
        }

        data.forEach(post => {
            post.createdAt = post.createdAt.toLocaleDateString();

            result.push({
                [POST.title]: post.title,
                [POST.description]: post.description,
                [POST['user.firstname']]: `${post['user.firstname']} ${post['user.lastname']}`,
                [POST.createdAt]: post.createdAt,
                [POST.likesCount]: post.likesCount,
                [POST.attachmentsCount]: post.attachmentsCount
            });
        });

        return result;
    }

    static async jsonToCSV(data, name) {
        const json2csvParser = new Parser();

        const csvFile = json2csvParser.parse(data);

        const filePath = path.join(`${os.tmpdir()}\\`, `${name}ExportData.csv`);

        fs.writeFileSync(filePath, csvFile);

        return filePath;
    }

    static async jsonToEXCEL(data, name) {
        const filePath = path.join(`${os.tmpdir()}\\`, `${name}ExportData.xlsx`);

        const xls = await json2xls(data);

        fs.writeFileSync(filePath, xls, 'binary');

        return filePath;
    }
}

const resizeImage = async file => {
    const filePath = `${os.tmpdir()}\\${file.key}`;

    await sharp(file.path).rotate().resize(200, 200).jpeg({ mozjpeg: true }).toFile(filePath);

    return filePath;
};

const verifyToken = async token => jwt.verify(token, config.JWT_SECRET);

module.exports = { ExportNormalizer, verifyToken, resizeImage };
