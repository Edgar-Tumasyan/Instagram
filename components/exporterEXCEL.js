const os = require('os');
const fs = require('fs');
const path = require('path');
const json2xls = require('json2xls');

const exporterNormalizer = require('./exporterNormalizer');

const exporterEXCEL = async users => {
    const data = await exporterNormalizer(users);

    const filePath = path.join(`${os.tmpdir()}\\`, 'exportData.xlsx');

    const xls = await json2xls(data);

    fs.writeFileSync(filePath, xls, 'binary');

    return filePath;
};

module.exports = exporterEXCEL;
