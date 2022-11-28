const _ = require('lodash');

module.exports = () => async (ctx, next) => {
    let { limit, offset } = ctx.query;

    limit = Number(limit);
    offset = Number(offset);

    if (!limit || limit <= 0 || _.isNaN(limit)) {
        limit = 2;
    }

    if (!offset || offset < 0 || _.isNaN(offset)) {
        offset = 0;
    }

    ctx.state.paginate = { limit, offset };

    await next();
};
