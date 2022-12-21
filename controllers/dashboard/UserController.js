const _ = require('lodash');
const { literal } = require('sequelize');

const { SortParam, SearchParam, ErrorMessages } = require('../../constants');
const { User, generateSearchQuery } = require('../../data/models');
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

module.exports = { findAll, deactivateUser, activateUser };
