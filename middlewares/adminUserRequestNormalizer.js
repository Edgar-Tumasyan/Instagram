const { UserStatus } = require('../data/lcp');
const { sortTypes, userSortFieldType } = require('../constants');

const adminUserRequestNormalizer = async (ctx, next) => {
    const { q, sortField, sortType, status } = ctx.query;

    if (!q) {
        ctx.query.q = '';
    }

    if (!sortField || !userSortFieldType.includes(sortField)) {
        ctx.query.sortField = 'createdAt';
    }

    if (!sortType || !sortTypes.includes(sortType.toUpperCase())) {
        ctx.query.sortType = 'DESC';
    }

    if (!status || status !== 'inactive') {
        ctx.query.status = UserStatus.Active;
    }

    await next();
};

module.exports = adminUserRequestNormalizer;
