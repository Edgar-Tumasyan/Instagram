const { Op, literal } = require('sequelize');
const _ = require('lodash');

const { Follow, Thread, ThreadRequest, ThreadUser, User, sequelize, generateSearchQuery } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { ThreadType, ThreadStatus } = require('../data/lcp');
const { SortParam, SearchParam } = require('../constants');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;
    const { id: userId } = ctx.state.user;

    const sortKey = SortParam.THREAD[sortField] ? SortParam.THREAD[sortField] : SortParam.THREAD.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.THREAD) : {};

    const { rows: threads, count: total } = await Thread.scope({
        method: ['allThreads', userId]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ threads, _meta: pagination(total) });
};

const findOne = async ctx => {
    const { threadId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const thread = await Thread.scope({ method: ['thread'] }).findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUser = await ThreadUser.findOne({ where: { threadId, userId } });

    if (_.isEmpty(threadUser)) {
        return ctx.forbidden(ErrorMessages.THREAD_USER_PERMISSION);
    }

    return ctx.ok({ thread });
};

const create = async ctx => {
    const { type, chatName, ids } = ctx.request.body;
    const { id: userId } = ctx.state.user;

    if (type === ThreadType.DIRECT && ids.length > 1) {
        return ctx.badRequest(ErrorMessages.DIRECT_THREAD_REQUEST);
    }

    const receivers = await User.findAndCountAll({ where: { id: { [Op.in]: ids } } });

    if (receivers.count < ids.length || receivers.count === 0) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    const existingThread =
        type === ThreadType.DIRECT
            ? await ThreadRequest.scope({ method: ['existingThread', userId, ids] }).findOne()
            : await ThreadRequest.scope({ method: ['existingChat', chatName, userId] }).findOne();

    if (existingThread) {
        const thread = await Thread.findByPk(existingThread.threadId);

        return ctx.ok({ thread });
    }

    const { rows: isFollowed, count } = await Follow.findAndCountAll({
        where: { followerId: userId, followingId: { [Op.in]: ids } }
    });

    if (type === ThreadType.GROUP && count < ids.length) {
        return ctx.notFound(ErrorMessages.GROUP_CHAT_USERS);
    }

    await sequelize.transaction(async t => {
        const thread =
            type === ThreadType.DIRECT
                ? await Thread.create({ type }, { transaction: t })
                : await Thread.create({ type, chatName }, { transaction: t });

        const threadId = thread.id;
        const status = type === ThreadType.DIRECT && _.isEmpty(isFollowed) ? ThreadStatus.PENDING : ThreadStatus.ACCEPTED;

        const threadUsers = [{ threadId, userId }];
        const threadRequests = [];

        for (const id of ids) {
            threadUsers.push({ threadId, userId: id });
            threadRequests.push({ senderId: userId, receiverId: id, threadId, status });
        }

        await ThreadUser.bulkCreate(threadUsers, { transaction: t });

        await ThreadRequest.bulkCreate(threadRequests, { transaction: t });

        return ctx.created({ thread });
    });
};

const remove = async ctx => {
    const { threadId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const thread = await Thread.scope({ method: ['thread'] }).findByPk(threadId);

    if (!thread) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_THREAD);
    }

    const threadUser = await ThreadUser.findOne({ where: { threadId, userId } });

    if (_.isEmpty(threadUser)) {
        return ctx.forbidden(ErrorMessages.THREAD_USER_PERMISSION);
    }

    if ((thread.type = ThreadType.GROUP)) {
        const threadCreater = await ThreadRequest.findOne({ where: { threadId, senderId: userId } });

        if (!threadCreater) {
            await threadUser.destroy();

            return ctx.noContent();
        }
    }

    await thread.destroy();

    return ctx.noContent();
};

module.exports = { findAll, findOne, create, remove };
