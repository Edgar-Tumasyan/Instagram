const { Follow, Thread, ThreadRequest, ThreadUser } = require('../data/models');

const findAll = async ctx => {
    const userId = ctx.state.user.id;

    const data = await ThreadUser.findAll({
        attributes: ['threadId'],
        where: { userId },
        raw: true
    });

    const threadIds = data.map(thread => thread.threadId);

    const threads = await Thread.scope({ method: ['allThreads', threadIds] }).findAll();

    ctx.body = { threads };
};

const create = async ctx => {
    const { profileId } = ctx.params;
    const userId = ctx.state.user.id;

    const existingThread = await ThreadRequest.scope({ method: ['existingThread', userId, profileId] }).findOne({
        raw: true
    });

    if (existingThread) {
        const thread = await Thread.findByPk(existingThread.threadId, { raw: true });

        return ctx.ok({ thread });
    }

    const thread = await Thread.create();

    await ThreadUser.bulkCreate([
        { threadId: thread.id, userId },
        { threadId: thread.id, userId: profileId }
    ]);

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    if (!isFollowed) {
        await ThreadRequest.create({ senderId: userId, receiverId: profileId, status: 'pending', threadId: thread.id });
    } else {
        await ThreadRequest.create({ senderId: userId, receiverId: profileId, status: 'accepted', threadId: thread.id });
    }

    return ctx.created({ thread });
};

module.exports = { findAll, create };
