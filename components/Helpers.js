const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const json2xls = require('json2xls');
const { Parser } = require('json2csv');

const { ExportParam, HomePageParam } = require('../constants');
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

const homePageNormalizer = async homePageData => {
    const currentYear = {};
    const lastYear = {};

    let currentYearTotal = 0;
    let lastYearTotal = 0;

    homePageData.forEach(data => {
        if (data.year === '22') {
            currentYear[data.name] = data.month;
            currentYearTotal += Number(data.month);
        } else {
            lastYear[data.name] = data.month;
            lastYearTotal += Number(data.month);
        }
    });

    const dataNormalizer = await homePageDataNormalizer(currentYear, lastYear);

    dataNormalizer.push({
        name: 'YTD',
        Month: currentYearTotal,
        'vs PM': 'N/A',
        'vs PY': Math.ceil(((currentYearTotal - lastYearTotal) * 100) / lastYearTotal)
    });

    return dataNormalizer.map(data => data);
};

const homePageDataNormalizer = async (currentYear, lastYear) => {
    const result = [];

    for (let i = 1; i < 13; ++i) {
        const j = i - 1;

        if (j === 0) {
            result.push({
                name: HomePageParam[i],
                Month: Number(currentYear[HomePageParam[i]]) || 'N/A',
                'vs PM':
                    Math.ceil(
                        ((Number(currentYear[HomePageParam[i]]) - Number(lastYear[HomePageParam[j]])) * 100) /
                            Number(lastYear[HomePageParam[j]])
                    ) || 'N/A',
                'vs PY':
                    Math.ceil(
                        ((Number(currentYear[HomePageParam[i]]) - Number(lastYear[HomePageParam[i]])) * 100) /
                            Number(lastYear[HomePageParam[i]])
                    ) || 'N/A'
            });
        } else {
            result.push({
                name: HomePageParam[i],
                Month: Number(currentYear[HomePageParam[i]]) || 'N/A',
                'vs PM':
                    Math.ceil(
                        ((Number(currentYear[HomePageParam[i]]) - Number(currentYear[HomePageParam[j]])) * 100) /
                            Number(currentYear[HomePageParam[j]])
                    ) || 'N/A',
                'vs PY':
                    Math.ceil(
                        ((Number(currentYear[HomePageParam[i]]) - Number(lastYear[HomePageParam[i]])) * 100) /
                            Number(lastYear[HomePageParam[i]])
                    ) || 'N/A'
            });
        }
    }

    return result;
};

module.exports = { ExportNormalizer, verifyToken, resizeImage, homePageNormalizer };
