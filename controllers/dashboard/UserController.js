const fs = require('fs');
const _ = require('lodash');
const { literal } = require('sequelize');

const { SortParam, SearchParam, ErrorMessages } = require('../../constants');
const { User, generateSearchQuery } = require('../../data/models');
const { ExportNormalizer } = require('../../components/Helpers');
const { UserStatus } = require('../../data/lcp');

const findAll = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const { rows: users, count: total } = await User.scope({
        method: ['usersForAdmin', filter]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const deactivateUser = async ctx => {
    const { id } = ctx.params;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + `${id}`);
    }

    user.status = UserStatus.Inactive;

    await user.save();

    return ctx.noContent();
};

const activateUser = async ctx => {
    const { id } = ctx.params;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + `${id}`);
    }

    user.status = UserStatus.Active;

    await user.save();

    return ctx.noContent();
};

const exportCSV = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { ids } = ctx.request.body;

    const filter = { status, profileCategory, ids };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const users = await User.scope({ method: ['exportForAdmin', filter] }).findAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        raw: true,
        offset,
        limit
    });

    const data = await ExportNormalizer.user(users);

    const csv = await ExportNormalizer.jsonToCSV(data, 'user');

    ctx.body = fs.createReadStream(csv);

    return ctx.attachment(csv);
};

const exportEXCEL = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { ids } = ctx.request.body;

    const filter = { status, profileCategory, ids };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const users = await User.scope({ method: ['exportForAdmin', filter] }).findAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        raw: true,
        offset,
        limit
    });

    const data = await ExportNormalizer.user(users);

    const excel = await ExportNormalizer.jsonToEXCEL(data, 'user');

    ctx.body = fs.createReadStream(excel);

    return ctx.attachment(excel);
};

module.exports = { findAll, deactivateUser, activateUser, exportCSV, exportEXCEL };
