const fs = require('fs');
const _ = require('lodash');
const { literal } = require('sequelize');

const { Post, generateSearchQuery } = require('../../data/models');
const { ExportNormalizer } = require('../../components/Helpers');
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

const exportCSV = async ctx => {
    const { q, sortType, sortField } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { ids } = ctx.request.body;

    const filter = { ids };

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const posts = await Post.scope({ method: ['postsForAdmin', filter] }).findAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        raw: true,
        offset,
        limit
    });

    const data = await ExportNormalizer.post(posts);

    const csv = await ExportNormalizer.jsonToCSV(data, 'post');

    ctx.body = fs.createReadStream(csv);

    return ctx.attachment(csv);
};

const exportEXCEL = async ctx => {
    const { q, sortType, sortField } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { ids } = ctx.request.body;

    const filter = { ids };

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const posts = await Post.scope({ method: ['postsForAdmin', filter] }).findAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        raw: true,
        offset,
        limit
    });

    const data = await ExportNormalizer.post(posts);

    const excel = await ExportNormalizer.jsonToEXCEL(data, 'post');

    ctx.body = fs.createReadStream(excel);

    return ctx.attachment(excel);
};

module.exports = { findAll, exportCSV, exportEXCEL };
