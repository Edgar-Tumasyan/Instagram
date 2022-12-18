const _ = require('lodash');
const fileType = require('file-type');
const compose = require('koa-compose');
const readChunk = require('read-chunk');
const { koaBody } = require('koa-body');
const randomString = require('randomstring');

async function normalizeFile(file) {
    const buffer = readChunk.sync(file.filepath, 0, 4100);

    const fileInfo = await fileType.fromBuffer(buffer);

    return {
        ext: _.get(fileInfo, 'ext'),
        mime: _.get(fileInfo, 'mime'),
        path: _.get(file, 'filepath'),
        name: _.get(file, 'newFilename'),
        size: _.toString(_.get(file, 'size')),
        key: `${randomString.generate()}.${_.get(fileInfo, 'ext')}`,
        type: _.head(_.split(_.get(fileInfo, 'mime'), '/'))
    };
}

async function normalizer(ctx, next) {
    if (ctx.request.type === 'multipart/form-data') {
        for (const key of Object.keys(ctx.request.files)) {
            const value = _.get(ctx.request.files, key);

            if (_.isArray(value)) {
                ctx.request.files[key] = [];

                for (const item of value) {
                    ctx.request.files[key].push(await normalizeFile(item));
                }
            } else if (_.isObject(value)) {
                ctx.request.files[key] = await normalizeFile(value);
            }
        }
    }

    if (!ctx.request.body) {
        ctx.request.body = {};
    }

    await next();
}

module.exports = () => compose([koaBody({ multipart: true, formidable: { keepExtensions: true } }), normalizer]);
