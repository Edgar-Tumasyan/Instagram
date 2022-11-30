const { Follow, Message, Thread, ThreadRequest, ThreadUser, User } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');

const sendMessage = async ctx => {
    const senderId = ctx.state.user.id;
    const recieverId = ctx.params.userId;

    const { text } = ctx.request.body;

    const user = await User.findByPk(recieverId);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + ` ${recieverId}`);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: senderId, followingId: recieverId }, raw: true });

    if (!isFollowed) {
        const existingMessageRequest = await ThreadRequest.findOne({ where: { senderId, recieverId }, raw: true });

        if (existingMessageRequest && existingMessageRequest.status === 'pending') {
            return ctx.badRequest({
                a: existingMessageRequest.threadId,
                message: 'You already send message this user, please wait'
            });
        } else if (existingMessageRequest && existingMessageRequest.status === 'approved') {
            return (ctx.body = existingMessageRequest.threadId);
        } else {
            const thread = await Thread.create({ lastMessage: text });

            await ThreadRequest.create({ senderId, recieverId, status: 'pending', threadId: thread.id });

            await ThreadUser.create({ threadId: thread.id, userId: senderId });

            await Message.create({ text, userId: senderId, threadId: thread.id });

            return (ctx.body = 'aaaa');
        }
    }

    return (ctx.body = { text });
};

module.exports = { sendMessage };
