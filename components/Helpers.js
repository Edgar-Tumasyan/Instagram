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

const homePageNormalizer = async (currentYearData, lastYearData) => {
    const currentYear = {};
    const lastYear = {};

    currentYearData.forEach(user => {
        currentYear[user.name] = user.month;
    });

    lastYearData.forEach(user => {
        lastYear[user.name] = user.month;
    });

    const dataNormalizer = await homePageDataNormalizer(currentYear, lastYear);

    return await dataNormalizer.map(data => data);
};

const homePageDataNormalizer = async (currentYear, lastYear) => {
    return [
        {
            name: 'Jan',
            Month: Number(currentYear.Jan) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Jan) - Number(lastYear.Dec)) * 100) / Number(lastYear.Dec)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Jan) - Number(lastYear.Jan)) * 100) / Number(lastYear.Jan)) || 'N/A'
        },
        {
            name: 'Feb',
            Month: Number(currentYear.Feb) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Feb) - Number(currentYear.Jan)) * 100) / Number(currentYear.Jan)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Feb) - Number(lastYear.Feb)) * 100) / Number(lastYear.Feb)) || 'N/A'
        },
        {
            name: 'Mar',
            Month: Number(currentYear.Mar) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Mar) - Number(currentYear.Feb)) * 100) / Number(currentYear.Feb)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Mar) - Number(lastYear.Mar)) * 100) / Number(lastYear.Mar)) || 'N/A'
        },
        {
            name: 'Apr',
            Month: Number(currentYear.Apr) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Apr) - Number(currentYear.Mar)) * 100) / Number(currentYear.Mar)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Apr) - Number(lastYear.Apr)) * 100) / Number(lastYear.Apr)) || 'N/A'
        },
        {
            name: 'May',
            Month: Number(currentYear.May) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.May) - Number(currentYear.Apr)) * 100) / Number(currentYear.Apr)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.May) - Number(lastYear.May)) * 100) / Number(lastYear.May)) || 'N/A'
        },

        {
            name: 'Jun',
            Month: Number(currentYear.Jun) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Jun) - Number(currentYear.May)) * 100) / Number(currentYear.May)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Jun) - Number(lastYear.Jun)) * 100) / Number(lastYear.Jun)) || 'N/A'
        },

        {
            name: 'Jul',
            Month: Number(currentYear.Jul) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Jul) - Number(currentYear.Jun)) * 100) / Number(currentYear.Jun)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Jul) - Number(lastYear.Jul)) * 100) / Number(lastYear.Jul)) || 'N/A'
        },
        {
            name: 'Aug',
            Month: Number(currentYear.Aug) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Aug) - Number(currentYear.Jul)) * 100) / Number(currentYear.Jul)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Aug) - Number(lastYear.Aug)) * 100) / Number(lastYear.Aug)) || 'N/A'
        },

        {
            name: 'Sep',
            Month: Number(currentYear.Sep) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Sep) - Number(currentYear.Aug)) * 100) / Number(currentYear.Aug)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Sep) - Number(lastYear.Sep)) * 100) / Number(lastYear.Sep)) || 'N/A'
        },
        {
            name: 'Oct',
            Month: Number(currentYear.Oct) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Oct) - Number(currentYear.Sep)) * 100) / Number(currentYear.Sep)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Oct) - Number(lastYear.Oct)) * 100) / Number(lastYear.Oct)) || 'N/A'
        },

        {
            name: 'Nov',
            Month: Number(currentYear.Nov) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Nov) - Number(currentYear.Oct)) * 100) / Number(currentYear.Oct)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Nov) - Number(lastYear.Nov)) * 100) / Number(lastYear.Nov)) || 'N/A'
        },
        {
            name: 'Dec',
            Month: Number(currentYear.Dec) || 'N/A',
            'vs PM': Math.ceil(((Number(currentYear.Dec) - Number(currentYear.Nov)) * 100) / Number(currentYear.Nov)) || 'N/A',
            'vs PY': Math.ceil(((Number(currentYear.Dec) - Number(lastYear.Dec)) * 100) / Number(lastYear.Dec)) || 'N/A'
        }
    ];
};

module.exports = { ExportNormalizer, verifyToken, resizeImage, homePageNormalizer };
