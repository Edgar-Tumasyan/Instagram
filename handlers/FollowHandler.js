const _ = require('lodash');
const { literal } = require('sequelize');

const { Follow, User, Notification, sequelize, generateSearchQuery } = require('../data/models');
const { FollowStatus, NotificationType, ProfileCategory } = require('../data/lcp');
const { SortParam, SearchParam, ErrorMessages } = require('../constants');

const getUserFollowers = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;
    const { profileId: followingId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const { rows: users, count: total } = await User.scope({
        method: ['followers', followingId, userId, filter]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const getUserFollowings = async ctx => {
    const { q, sortField, sortType, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;
    const { profileId: followerId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const { rows: users, count: total } = await User.scope({
        method: ['followings', followerId, userId, filter]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const create = async ctx => {
    const { id: userId } = ctx.state.user;
    const { profileId } = ctx.params;

    if (profileId === userId) {
        return ctx.badRequest(ErrorMessages.FOLLOW_PERMISSION);
    }

    const user = await User.findByPk(profileId);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    if (isFollowed && isFollowed.status === FollowStatus.APPROVED) {
        return ctx.badRequest(ErrorMessages.FOLLOW_APPROVED);
    } else if (isFollowed && isFollowed.status === FollowStatus.PENDING) {
        return ctx.badRequest(ErrorMessages.FOLLOW_PENDING);
    }

    const status = user.profileCategory === ProfileCategory.PRIVATE ? FollowStatus.PENDING : FollowStatus.APPROVED;

    const notificationType =
        user.profileCategory === ProfileCategory.PRIVATE ? NotificationType.User_FOLLOW_REQUEST : NotificationType.USER_FOLLOW;

    const message =
        user.profileCategory === ProfileCategory.PRIVATE
            ? `Your request sent user with id: ${profileId}`
            : `You follow user with id ${profileId}`;

    await sequelize.transaction(async t => {
        const follow = await Follow.create({ followerId: userId, followingId: profileId, status }, { transaction: t });

        await Notification.create(
            { senderId: userId, receiverId: profileId, followId: follow.id, type: notificationType },
            { transaction: t }
        );
    });

    return ctx.created({ message });
};

const acceptFollowInvitation = async ctx => {
    const { id: followingId } = ctx.state.user;
    const { followerId } = ctx.params;

    const isFollowed = await Follow.findOne({ where: { followingId, followerId }, raw: true });

    if (!isFollowed || isFollowed.status === FollowStatus.APPROVED) {
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
        return ctx.badRequest(ErrorMessages.FOLLOW_INVITATION_CANCEL);
    }

    await Follow.destroy({ where: { followerId, followingId } });

    return ctx.noContent();
};

const remove = async ctx => {
    const { id: userId } = ctx.state.user;
    const { profileId } = ctx.params;

    if (profileId === userId) {
        return ctx.badRequest(ErrorMessages.FOLLOW_PERMISSION);
    }

    const isFollowed = await Follow.findOne({ where: { followerId: userId, followingId: profileId } });

    if (!isFollowed) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_FOLLOW);
    }

    await isFollowed.destroy();

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
