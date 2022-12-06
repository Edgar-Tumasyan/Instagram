const { Follow, Message, Thread, ThreadRequest, ThreadUser, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { Op } = require('sequelize');

const create = async ctx => {
    const { threadId, profileId } = ctx.params;
    const userId = ctx.state.user.id;

    const threadUser = await ThreadUser.findOne({ where: { threadId, userId }, raw: true });

    if (!threadUser) {
        return ctx.badRequest(ErrorMessages.NO_THREAD_USER);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    if (!isFollowed) {
        const existingMessage = await Message.findOne({ where: { userId, threadId } });

        const existingRequest = await ThreadRequest.findOne({ where: { senderId: userId, receiverId: profileId }, raw: true });

        if (existingMessage && existingRequest && existingRequest.status === 'pending') {
            return ctx.badRequest(ErrorMessages.EXISTING_PENDING_REQUEST);
        } else if (existingMessage && existingRequest && existingRequest.status === 'decline') {
            return ctx.badRequest(ErrorMessages.EXISTING_DECLINE_REQUEST);
        }
    }

    const text = ctx.request.body;

    await sequelize.transaction(async t => {
        const message = await Message.create({ text, userId, threadId }, { raw: true, transaction: t });

        await Thread.update({ lastMessageId: message.id }, { where: { id: message.threadId }, transaction: t });

        const receiverIds = await ThreadUser.findAll({
            attributes: ['userId'],
            where: { threadId, userId: { [Op.ne]: userId } },
            raw: true,
            transaction: t
        });

        receiverIds.forEach(receiverId => global.io.to(receiverId.userId).emit('message', { data: message }));

        return ctx.created({ message });
    });
};

module.exports = { create };
