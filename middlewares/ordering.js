const { SortParam } = require('../constants');

module.exports = () => async (ctx, next) => {
    const { sortType } = ctx.query;

    if (!sortType || !SortParam.TYPE.includes(sortType.toUpperCase())) {
        ctx.query.sortType = 'DESC';
    }

    await next();
};
