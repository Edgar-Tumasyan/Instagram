const _ = require('lodash');

module.exports = () => async (ctx, next) => {
    let { limit, offset } = ctx.query;

    limit = Number(limit);
    offset = Number(offset);

    if (!limit || limit <= 0 || _.isNaN(limit)) {
        limit = 10;
    }

    if (!offset || offset < 0 || _.isNaN(offset)) {
        offset = 0;
    }

    ctx.state.paginate = {
        limit,
        offset,
        pagination: total => {
            return { total, pageCount: Math.ceil(total / limit), currentPage: Math.ceil((offset + 1) / limit) || 1 };
        }
    };

    await next();
};
