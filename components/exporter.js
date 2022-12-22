const os = require('os');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const { ExportDataType } = require('../constants');

const exporter = async users => {
    users.forEach(user => {
        user.createdAt = user.createdAt.toLocaleDateString();
        user.status = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    });

    const data = new Parser({ fields: ExportDataType.USER, quote: '', delimiter: '\t' });

    const csvFile = data.parse(users);

    const filePath = path.join(`${os.tmpdir()}\\`, 'exportData.csv');

    fs.writeFileSync(filePath, csvFile);

    return filePath;
};

module.exports = exporter;
