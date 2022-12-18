const { Op } = require('sequelize');

const { Notification, User } = require('../data/models');

const findAll = async ctx => {
    const { id: receiverId } = ctx.state.user;

    const { limit, offset } = ctx.state.paginate;

    const notifications = await Notification.scope({ method: ['allNotifications', receiverId] }).findAll({ raw: true });

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

    return (ctx.body = {
        notifications,
        _meta: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
};

module.exports = { findAll };
