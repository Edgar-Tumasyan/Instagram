const { Op } = require('sequelize');
const _ = require('lodash');

const { Notification, User } = require('../data/models');
const { ErrorMessages } = require('../constants');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { id: receiverId } = ctx.state.user;

    const notifications = await Notification.scope({ method: ['allNotifications', receiverId] }).findAll({
        raw: true,
        offset,
        limit
    });

    await Notification.update({ isSeen: true }, { where: { receiverId } });

    const senderIds = notifications.map(notification => notification.senderId);

    const users = await User.findAll({ where: { id: { [Op.in]: senderIds } }, raw: true });

    for (const notification of notifications) {
        const user = users.find(user => user.id === notification.senderId);

        notification.firstname = user.firstname;
        notification.lastname = user.lastname;
    }

    const [data] = await Notification.scope({ method: ['count', receiverId] }).findAll({ raw: true });

    const total = data.count;

    return ctx.ok({ notifications, _meta: pagination(total) });
};

const allRead = async ctx => {
    const { id: receiverId } = ctx.state.user;

    await Notification.update({ isRead: true }, { where: { receiverId } });

    const notifications = await Notification.findAll({ where: { receiverId } });

    return ctx.ok({ notifications });
};

const read = async ctx => {
    const { id: receiverId } = ctx.state.user;
    const { id } = ctx.request.params;

    const notification = await Notification.findOne({ where: { id, receiverId } });

    if (_.isEmpty(notification)) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_NOTIFICATION);
    }

    await Notification.update({ isRead: true }, { where: { id } });

    const data = await Notification.findByPk(id);

    return ctx.ok({ notification: data });
};

const unread = async ctx => {
    const { id: receiverId } = ctx.state.user;
    const { id } = ctx.request.params;

    const notification = await Notification.findOne({ where: { id, receiverId } });

    if (_.isEmpty(notification)) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_NOTIFICATION);
    }

    await Notification.update({ isRead: false }, { where: { id } });

    const data = await Notification.findByPk(id);

    return ctx.ok({ notification: data });
};

const remove = async ctx => {
    const { id: receiverId } = ctx.state.user;
    const { id } = ctx.request.params;

    const notification = await Notification.findOne({ where: { id, receiverId } });

    if (_.isEmpty(notification)) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_NOTIFICATION);
    }

    await notification.destroy();

    return ctx.noContent();
};

module.exports = { findAll, allRead, read, unread, remove };
