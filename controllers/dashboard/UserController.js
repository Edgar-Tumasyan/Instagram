const _ = require('lodash');
const { literal } = require('sequelize');

const { UserStatus } = require('../../data/lcp');
const ErrorMessages = require('../../constants/ErrorMessages');
const { User, generateSearchQuery } = require('../../data/models');
const { userSortFieldType, userFilterFields } = require('../../constants');

const findAll = async ctx => {
    const { limit, offset } = ctx.state.paginate;
    const { q, sortType, status } = ctx.query;

    const search = !_.isEmpty(q) ? generateSearchQuery(q, userFilterFields) : {};

    let sortField = '"createdAt"';

    if (userSortFieldType[ctx.query.sortField]) {
        sortField = userSortFieldType[ctx.query.sortField];
    }

    const { rows: users, count: total } = await User.scope({
        method: ['usersForAdmin', q, sortField, sortType, status]
    }).findAndCountAll({
        where: { status, ...search },
        order: [[literal(`${sortField}`), `${sortType}`]],
        offset,
        limit
    });

    return ctx.ok({
        users,
        _meta: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
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
