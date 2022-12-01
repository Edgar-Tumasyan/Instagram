const { Follow, Message, Thread, ThreadRequest, ThreadUser } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');

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

    const message = await Message.create({ text, userId, threadId }, { raw: true });

    await Thread.update({ lastMessageId: message.id }, { where: { id: message.threadId } });

    return ctx.created({ message });
};

module.exports = { create };
