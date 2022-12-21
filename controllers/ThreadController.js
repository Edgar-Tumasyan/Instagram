const { Follow, Thread, ThreadRequest, ThreadUser, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { id: userId } = ctx.state.user;

    const { rows: threads, count: total } = await Thread.scope({
        method: ['allThreads', userId]
    }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({ threads, _meta: pagination(total) });
};

const create = async ctx => {
    const { id: userId } = ctx.state.user;
    const { profileId } = ctx.params;

    if (userId === profileId) {
        return ctx.badRequest(ErrorMessages.NO_CREATE_THREAD);
    }

    const existingThread = await ThreadRequest.scope({ method: ['existingThread', userId, profileId] }).findOne({ raw: true });

    if (existingThread) {
        const thread = await Thread.findByPk(existingThread.threadId, { raw: true });

        return ctx.ok({ thread });
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    await sequelize.transaction(async t => {
        const thread = await Thread.create({}, { transaction: t });

        const threadId = thread.id;

        await ThreadUser.bulkCreate(
            [
                { threadId, userId },
                { threadId, userId: profileId }
            ],
            { transaction: t }
        );

        if (!isFollowed) {
            await ThreadRequest.create(
                { senderId: userId, receiverId: profileId, status: 'pending', threadId },
                { transaction: t }
            );
        } else {
            await ThreadRequest.create(
                { senderId: userId, receiverId: profileId, status: 'accepted', threadId },
                { transaction: t }
            );
        }

        return ctx.created({ thread });
    });
};

module.exports = { findAll, create };
