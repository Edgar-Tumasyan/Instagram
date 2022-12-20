const { sortTypes } = require('../constants');
const { UserStatus } = require('../data/lcp');

const adminRequestNormalizer = async (ctx, next) => {
    const { sortType, status } = ctx.query;

    if (!sortType || !sortTypes.includes(sortType.toUpperCase())) {
        ctx.query.sortType = 'DESC';
    }

    if (!status || status !== 'inactive') {
        ctx.query.status = 'active';
    }

    await next();
};

module.exports = adminRequestNormalizer;
