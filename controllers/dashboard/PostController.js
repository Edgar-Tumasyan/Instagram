const { literal } = require('sequelize');

const { Post } = require('../../data/models');

const findAll = async ctx => {
    const { limit, offset } = ctx.state.paginate;
    const { q, sortField, sortType } = ctx.query;

    const search = [
        literal(`"Post"."title" ILIKE '%${q}%' or "user"."firstname" ILIKE '%${q}%' or "user"."lastname" ILIKE '%${q}%'`)
    ];

    const { rows: posts, count: total } = await Post.scope({
        method: ['postsForAdmin', q]
    }).findAndCountAll({
        where: { ...search },
        order: [[literal(`${sortField}`), `${sortType}`]],
        offset,
        limit
    });

    return ctx.ok({
        posts,
        _meta: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
};

module.exports = { findAll };
