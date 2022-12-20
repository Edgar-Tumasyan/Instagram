const { sortTypes, postSortFieldType } = require('../constants');

const adminPostRequestNormalizer = async (ctx, next) => {
    const { q, sortField, sortType } = ctx.query;

    if (!q) {
        ctx.query.q = '';
    }

    if (!sortField || !postSortFieldType.includes(sortField)) {
        ctx.query.sortField = 'createdAt';
    }

    if (!sortType || !sortTypes.includes(sortType.toUpperCase())) {
        ctx.query.sortType = 'DESC';
    }

    await next();
};

module.exports = adminPostRequestNormalizer;
