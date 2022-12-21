const _ = require('lodash');
const { literal } = require('sequelize');

const { Post, Like, User, Follow, Notification, sequelize, generateSearchQuery } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { SortParam, FilterParam } = require('../constants');
const { NotificationType } = require('../data/lcp');

const postLikesUsers = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;
    const { postId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, FilterParam.USER) : {};

    const { rows: users, count: total } = await User.scope({
        method: ['likesUsers', postId, userId, filter]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        limit,
        offset
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const create = async ctx => {
    const { id: userId } = ctx.state.user;
    const { postId } = ctx.params;

    const post = await Post.scope({ method: ['singlePost', userId] }).findByPk(postId);

    if (!post) {
        return ctx.badRequest(ErrorMessages.NO_POST + ` ${postId}`);
    }

    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (existingLike) {
        return ctx.badRequest(ErrorMessages.EXISTING_LIKE);
    }

    if (post.user.profileCategory === 'private' && userId !== post.user.id) {
        const allowedLike = await Follow.findOne({
            where: { followerId: userId, followingId: post.user.id, status: 'approved' }
        });

        if (!allowedLike) {
            return ctx.forbidden(ErrorMessages.LIKE_PERMISSION);
        }
    }

    await sequelize.transaction(async t => {
        await Like.create({ userId, postId }, { transaction: t });

        await Notification.create(
            { type: NotificationType.POST_LIKE, senderId: userId, receiverId: post.user.id, postId },
            { transaction: t }
        );
    });

    const data = await Post.scope({ method: ['singlePost', userId] }).findByPk(postId);

    return ctx.created({ post: data });
};

const remove = async ctx => {
    const { postId } = ctx.params;

    const post = await Post.findByPk(postId);

    if (!post) {
        return ctx.badRequest(ErrorMessages.NO_POST + ` ${postId}`);
    }

    const { id: userId } = ctx.state.user;

    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (!existingLike) {
        return ctx.badRequest(ErrorMessages.NO_LIKE);
    }

    await Like.destroy({ where: { userId, postId } });

    return ctx.noContent();
};

module.exports = { postLikesUsers, create, remove };
