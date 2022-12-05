const { Notification, User } = require('../data/models');
const { Op } = require('sequelize');

const findAll = async ctx => {
    const receiverId = ctx.state.user.id;
    const { limit, offset } = ctx.state.paginate;

    const notifications = await Notification.scope({ method: ['all', receiverId] }).findAll({ raw: true });

    await Notification.update({ isSeen: true }, { where: { receiverId } });

    const senderIds = notifications.map(notification => notification.senderId);

    const users = await User.findAll({ where: { id: { [Op.in]: senderIds } }, raw: true });

    for (const notification of notifications) {
        const user = users.find(user => user.id === notification.senderId);

        notification.firstname = user.firstname;
        notification.lastname = user.lastname;
    }

    const total = await Notification.count({ where: { receiverId } });

    return (ctx.body = {
        notifications,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

module.exports = { findAll };
