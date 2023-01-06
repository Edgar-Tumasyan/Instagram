const fs = require('fs');
const _ = require('lodash');
const { literal } = require('sequelize');

const { SortParam, SearchParam, ErrorMessages, ExportParam } = require('../../constants');
const { User, generateSearchQuery } = require('../../data/models');
const { Cloudinary, Helpers } = require('../../components');

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

const updateUserStatus = async ctx => {
    const { status } = ctx.request.body;
    const { id } = ctx.params;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    user.status = status;

    await user.save();

    return ctx.ok(user);
};

const exportData = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { type, ids } = ctx.request.body;

    const dataType = ExportParam.TYPE.includes(type) ? type : ExportParam.TYPE[0];

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

    const normalizedData = await Helpers.ExportNormalizer.user(users);

    const data =
        dataType === ExportParam.TYPE[0]
            ? await Helpers.ExportNormalizer.jsonToCSV(normalizedData, 'user')
            : await Helpers.ExportNormalizer.jsonToEXCEL(normalizedData, 'user');

    ctx.body = fs.createReadStream(data);

    return ctx.attachment(data);
};

const remove = async ctx => {
    const { id } = ctx.params;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    if (user.avatar) {
        await Cloudinary.delete(user.avatarPublicId);
    }

    await user.destroy();

    return ctx.noContent();
};

module.exports = { findAll, updateUserStatus, exportData, remove };
