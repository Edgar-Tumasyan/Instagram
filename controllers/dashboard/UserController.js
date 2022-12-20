const { Op } = require('sequelize');

const { User } = require('../../data/models');
const { UserStatus } = require('../../data/lcp');
const ErrorMessages = require('../../constants/ErrorMessages');

const findAll = async ctx => {
    const { limit, offset } = ctx.state.paginate;
    const { q, sortField, sortType, status } = ctx.query;

    const { rows: users, count: total } = await User.scope({
        method: ['usersForAdmin', q, sortField, sortType, status]
    }).findAndCountAll({
        where: { status, [Op.or]: [{ firstname: { [Op.iLike]: `%${q}%` } }, { lastname: { [Op.iLike]: `%${q}%` } }] },
        order: [[`${sortField}`, `${sortType}`]],
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
