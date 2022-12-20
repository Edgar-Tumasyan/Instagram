const _ = require('lodash');
const { literal } = require('sequelize');

const { postSortFieldType } = require('../../constants');
const { Post, generateSearchQuery } = require('../../data/models');

const findAll = async ctx => {
    const { q, sortType } = ctx.query;
    const { limit, offset } = ctx.state.paginate;

    const search = !_.isEmpty(q) ? generateSearchQuery(q, ['title', 'firstname', 'lastname']) : {};

    let sortField = '"Post"."createdAt"';

    if (postSortFieldType[ctx.query.sortField]) {
        sortField = postSortFieldType[ctx.query.sortField];
    }

    const { rows: posts, count: total } = await Post.scope({
        method: ['postsForAdmin']
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
