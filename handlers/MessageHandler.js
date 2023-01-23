const { literal } = require('sequelize');
const _ = require('lodash');

const { Follow, Message, Thread, ThreadRequest, ThreadUser, sequelize, generateSearchQuery } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { ThreadType, ThreadStatus } = require('../data/lcp');
const { SortParam, SearchParam } = require('../constants');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;
    const { id: userId } = ctx.state.user;
    const { threadId } = ctx.params;

    const thread = await Thread.findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUser = await ThreadUser.findOne({ where: { threadId, userId } });

    if (!threadUser) {
        return ctx.badRequest(ErrorMessages.THREAD_USER_PERMISSION);
    }

    const sortKey = SortParam.MESSAGE[sortField] ? SortParam.MESSAGE[sortField] : SortParam.MESSAGE.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.MESSAGE) : {};

    const { rows: messages, count: total } = await Message.findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { threadId, ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ messages, _meta: pagination(total) });
};

const create = async ctx => {
    const { id: userId } = ctx.state.user;
    const { threadId } = ctx.params;
    const text = ctx.request.body;

    const thread = await Thread.findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUsers = await ThreadUser.findAll({ attributes: ['userId'], where: { threadId } });

    let threadUser = false;
    let receiverUser = null;

    for (const user of threadUsers) {
        if (user.userId === userId) {
            threadUser = true;
        } else if (user.userId !== userId && thread.type === ThreadType.DIRECT) {
            receiverUser = user.userId;
        }
    }

    if (!threadUser) {
        return ctx.badRequest(ErrorMessages.THREAD_USER_PERMISSION);
    }

    if (receiverUser) {
        const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: receiverUser } });

        if (!isFollowed) {
            const existingMessage = await Message.findOne({ where: { userId, threadId } });

            const existingRequest = await ThreadRequest.findOne({ where: { senderId: userId, receiverId: receiverUser } });

            if (existingMessage && existingRequest && existingRequest.status === ThreadStatus.PENDING) {
                return ctx.badRequest(ErrorMessages.EXISTING_PENDING_REQUEST);
            } else if (existingMessage && existingRequest && existingRequest.status === ThreadStatus.DECLINE) {
                return ctx.badRequest(ErrorMessages.EXISTING_DECLINE_REQUEST);
            }
        }
    }

    const message = await sequelize.transaction(async t => {
        const message = await Message.create({ text, userId, threadId }, { transaction: t });

        await Thread.update({ lastMessageId: message.id }, { where: { id: threadId }, transaction: t });

        return message;
    });

    threadUsers.forEach(receiverId => global.io.to(receiverId.userId).emit('message', { data: message }));

    return ctx.created({ message });
};

const update = async ctx => {
    const { threadId, messageId } = ctx.params;
    const { id: userId } = ctx.state.user;
    const text = ctx.request.body;

    const thread = await Thread.findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUsers = await ThreadUser.findAll({ attributes: ['userId'], where: { threadId } });

    let threadUser = false;

    for (const user of threadUsers) {
        if (user.userId === userId) {
            threadUser = true;
        }
    }

    if (!threadUser) {
        return ctx.badRequest(ErrorMessages.THREAD_USER_PERMISSION);
    }

    const message = await Message.findByPk(messageId);

    if (!message) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_MESSAGE);
    } else if (message.userId !== userId) {
        return ctx.forbidden(ErrorMessages.MESSAGE_PERMISSION);
    }

    await Message.update({ text }, { where: { id: messageId } });

    const data = await Message.findByPk(messageId);

    threadUsers.forEach(receiverId => global.io.to(receiverId.userId).emit('message', { data }));

    return ctx.ok({ message: data });
};

const remove = async ctx => {
    const { threadId, messageId } = ctx.params;
    const { id: userId } = ctx.state.user;

    const thread = await Thread.findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUser = await ThreadUser.findOne({ where: { threadId, userId } });

    if (!threadUser) {
        return ctx.badRequest(ErrorMessages.THREAD_USER_PERMISSION);
    }

    const message = await Message.findByPk(messageId);

    if (!message) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_MESSAGE);
    } else if (message.userId !== userId) {
        return ctx.forbidden(ErrorMessages.MESSAGE_PERMISSION);
    }

    const lastMessage = await Message.scope({ method: ['lastMessage', messageId] }).findOne();

    const lastMessageId = !_.isEmpty(lastMessage) ? lastMessage.id : null;

    await sequelize.transaction(async t => {
        await Thread.update({ lastMessageId }, { where: { id: threadId }, transaction: t });

        await message.destroy({ transaction: t });
    });

    return ctx.noContent();
};

module.exports = { findAll, create, update, remove };
