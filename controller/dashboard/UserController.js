const { User } = require('../../data/models');

const findAll = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { q, sortField, sortType, status } = ctx.query;

    const { rows: users, count: total } = await User.scope({
        method: ['usersForAdmin', q, sortField, sortType, status]
    }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({
        users,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

module.exports = { findAll };
