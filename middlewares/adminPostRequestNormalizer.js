const { sortTypes, postSortFieldType } = require('../constants');

const adminPostRequestNormalizer = async (ctx, next) => {
    const { q, sortField, sortType } = ctx.query;

    if (!q) {
        ctx.query.q = '';
    }

    if (!sortField || !postSortFieldType.includes(sortField) || sortField === 'createdAt') {
        ctx.query.sortField = `"Post"."createdAt"`;
    } else if (sortField === 'username') {
        ctx.query.sortField = `CONCAT("user"."firstname", "user"."lastname")`;
    }

    if (!sortType || !sortTypes.includes(sortType.toUpperCase())) {
        ctx.query.sortType = 'DESC';
    }

    await next();
};

module.exports = adminPostRequestNormalizer;
