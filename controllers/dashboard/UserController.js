const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { Parser } = require('json2csv');
const { literal, Op } = require('sequelize');

const { SortParam, SearchParam, ErrorMessages, ExportUserDataType } = require('../../constants');
const { User, generateSearchQuery } = require('../../data/models');
const { UserStatus } = require('../../data/lcp');

const exportData = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { ids } = ctx.request.body;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const users = await User.scope({ method: ['exportForAdmin', filter] }).findAll({
        where: { ...searchCondition, id: { [Op.in]: ids } },
        order: [[literal(`${sortKey}`), `${sortType}`]],
        raw: true,
        offset,
        limit
    });

    const data = JSON.parse(JSON.stringify(users));

    data.forEach(user => {
        user.createdAt = user.createdAt.substring(0, 10);
        user.status = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    });

    const jsonData = new Parser({ fields: ExportUserDataType.USER, quote: '', delimiter: '\t' });

    const csvFile = jsonData.parse(data);

    const filePath = path.join(`${os.tmpdir()}\\`, 'exportData.csv');

    fs.writeFileSync(filePath, csvFile);

    ctx.body = fs.createReadStream(filePath);

    return ctx.attachment(filePath);
};

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

module.exports = { findAll, deactivateUser, activateUser, exportData };
