const ErrorMessages = require('../constants/ErrorMessages');
const { Follow, Thread, ThreadRequest, ThreadUser, sequelize } = require('../data/models');

const findAll = async ctx => {
    const { id: userId } = ctx.state.user;

    const { limit, offset } = ctx.state.paginate;

    const { rows: threads, count: total } = await Thread.scope({ method: ['allThreads', userId] }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({
        threads,
        _meta: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
};

const create = async ctx => {
    const { profileId } = ctx.params;
    const { id: userId } = ctx.state.user;

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
