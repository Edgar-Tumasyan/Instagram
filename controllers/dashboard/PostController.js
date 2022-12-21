const _ = require('lodash');
const { literal } = require('sequelize');

const { Post, generateSearchQuery } = require('../../data/models');
const { SortParam, SearchParam } = require('../../constants');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const { rows: posts, count: total } = await Post.scope({
        method: ['postsForAdmin']
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ posts, _meta: pagination(total) });
};

module.exports = { findAll };
