const { FollowStatus, NotificationType } = require('../data/lcp');
const { Follow, User, Notification, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');

const getUserFollowers = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { profileId: followingId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const { rows: users, count: total } = await User.scope({ method: ['followers', followingId, userId] }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({
        users,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

const getUserFollowings = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { profileId: followerId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const { rows: users, count: total } = await User.scope({ method: ['followings', followerId, userId] }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({
        users,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

const create = async ctx => {
    const { profileId } = ctx.params;
    const { id: userId } = ctx.state.user;

    if (profileId === userId) {
        return ctx.badRequest(ErrorMessages.FOLLOW_PERMISSION);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId }, raw: true });

    if (isFollowed && isFollowed.status === 'approved') {
        return ctx.badRequest(ErrorMessages.FOLLOW_APPROVED + ` ${profileId}`);
    }

    if (isFollowed && isFollowed.status === 'pending') {
        return ctx.badRequest(ErrorMessages.FOLLOW_PENDING + ` ${profileId}`);
    }

    const user = await User.findByPk(profileId, { raw: true });

    if (user.profileCategory === 'private') {
        await sequelize.transaction(async t => {
            const followRequest = await Follow.create(
                { followerId: userId, followingId: profileId, status: FollowStatus.PENDING },
                { transaction: t }
            );

            await Notification.create(
                {
                    type: NotificationType.USER_FOLLOW,
                    senderId: userId,
                    receiverId: profileId,
                    followId: followRequest.id
                },
                { transaction: t }
            );
        });

        return ctx.created({ message: `Your request sent user with id: ${profileId}` });
    }

    await sequelize.transaction(async t => {
        const follow = await Follow.create(
            { followerId: userId, followingId: profileId, status: FollowStatus.APPROVED },
            { raw: true, transaction: t }
        );

        await Notification.create(
            {
                type: NotificationType.USER_FOLLOW,
                senderId: userId,
                receiverId: profileId,
                followId: follow.id
            },
            { transaction: t }
        );

        return ctx.created({ message: `You follow user with id: ${profileId}` });
    });
};

const acceptFollowInvitation = async ctx => {
    const { id: followingId } = ctx.state.user;
    const { followerId } = ctx.params;

    const isFollowed = await Follow.findOne({ where: { followingId, followerId }, raw: true });

    if (!isFollowed || isFollowed.status === 'approved') {
        return ctx.badRequest(ErrorMessages.FOLLOW_REQUEST);
    }

    await Follow.update({ status: FollowStatus.APPROVED }, { where: { followerId, followingId } });

    return ctx.ok({ message: `You accept follow invitation user with id: ${followerId}` });
};

const declineFollowInvitation = async ctx => {
    const { id: followingId } = ctx.state.user;
    const { followerId } = ctx.params;

    const isFollowed = await Follow.findOne({ where: { followingId, followerId }, raw: true });

    if (!isFollowed) {
        return ctx.badRequest(ErrorMessages.FOLLOW_REQUEST);
    }

    await Follow.destroy({ where: { followerId, followingId } });

    return ctx.noContent();
};

const cancelFollowInvitation = async ctx => {
    const { profileId: followingId } = ctx.params;
    const { id: followerId } = ctx.state.user;

    const isFollowed = await Follow.findOne({ where: { followingId, followerId }, raw: true });

    if (!isFollowed) {
        return ctx.badRequest({
            message: `You don't sent follow invitation user with id: ${followingId} or user cancel your follow invitation`
        });
    }

    await Follow.destroy({ where: { followerId, followingId } });

    return ctx.noContent();
};

const remove = async ctx => {
    const { profileId } = ctx.params;
    const { id: userId } = ctx.state.user;

    if (profileId === userId) {
        return ctx.badRequest(ErrorMessages.FOLLOW_PERMISSION);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    if (!isFollowed) {
        return ctx.notFound(ErrorMessages.NO_FOLLOW + ` ${profileId}`);
    }

    await Follow.destroy({ where: { followerId: userId, followingId: profileId } });

    return ctx.noContent();
};

module.exports = {
    remove,
    create,
    getUserFollowers,
    getUserFollowings,
    cancelFollowInvitation,
    acceptFollowInvitation,
    declineFollowInvitation
};
