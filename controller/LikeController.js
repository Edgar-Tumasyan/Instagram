const { Post, Like, User, Follow, Notification, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { NotificationType } = require('../data/lcp');

const postLikesUsers = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { postId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const { rows: users, count: total } = await User.scope({ method: ['likesUsers', postId, userId] }).findAndCountAll({
        limit,
        offset
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
    const { postId } = ctx.params;

    const post = await Post.scope({ method: ['singlePost'] }).findByPk(postId);

    if (!post) {
        return ctx.badRequest(ErrorMessages.NO_POST + ` ${postId}`);
    }

    const userId = ctx.state.user.id;

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

    const data = await Post.scope({ method: ['singlePost'] }).findByPk(postId);

    return ctx.created({ post: data });
};

const remove = async ctx => {
    const { postId } = ctx.params;

    const post = await Post.findByPk(postId);

    if (!post) {
        return ctx.badRequest(ErrorMessages.NO_POST + ` ${postId}`);
    }

    const userId = ctx.state.user.id;

    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (!existingLike) {
        return ctx.badRequest(ErrorMessages.NO_LIKE);
    }

    await Like.destroy({ where: { userId, postId } });

    return ctx.noContent();
};

module.exports = { postLikesUsers, create, remove };
