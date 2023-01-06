const { Op } = require('sequelize');

const { Follow, Thread, ThreadRequest, ThreadUser, User, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { ThreadType, ThreadStatus } = require('../data/lcp');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { id: userId } = ctx.state.user;

    /// /// id with body body type and userIds []

    const { rows: threads, count: total } = await Thread.scope({
        method: ['allThreads', userId]
    }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({ threads, _meta: pagination(total) });
};

/// /logic group thread
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

    /// ///// we have threadId if exist check in direct and continue

    // if (existingThread) {
    //     const thread = await Thread.findByPk(existingThread.threadId);
    //
    //     return ctx.ok({ thread });
    // }

    // in group can get all followings and check with includec
    // const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: ids } });

    await sequelize.transaction(async t => {
        const thread =
            type === ThreadType.DIRECT
                ? await Thread.create({ type }, { transaction: t })
                : await Thread.create({ type, chatName }, { transaction: t });

        const threadId = thread.id;

        await ThreadUser.bulkCreate(
            [
                { threadId, userId: ids[0] },
                { threadId, userId: ids[1] },
                //
                { threadId, userId: ids[2] }
            ],
            { transaction: t }
        );

        // const status = isFollowed ? ThreadStatus.ACCEPTED : ThreadStatus.PENDING;

        const status = ThreadStatus.ACCEPTED;

        await ThreadRequest.bulkCreate(
            [
                { senderId: userId, receiverId: ids[0], status, threadId },
                { senderId: userId, receiverId: ids[1], status, threadId }
            ],
            { transaction: t }
        );

        return ctx.created({ thread });
    });
};

module.exports = { findAll, create };
