const { Notification } = require('../data/models');

const findAll = async ctx => {
    const receiverId = ctx.state.user.id;

    const { rows: notifications, count: total } = await Notification.scope({
        method: ['allNotifications', receiverId]
    }).findAndCountAll();

    ctx.body = { notifications, total };
};

module.exports = { findAll };
