const os = require('os');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const exporterNormalizer = require('./exporterNormalizer');

const exporterCSV = async users => {
    const data = await exporterNormalizer(users);

    const json2csvParser = new Parser();

    const csvFile = json2csvParser.parse(data);

    const filePath = path.join(`${os.tmpdir()}\\`, 'exportData.csv');

    fs.writeFileSync(filePath, csvFile);

    return filePath;
};

module.exports = exporterCSV;
