const _ = require('lodash');
const { literal } = require('sequelize');

const { Post, Attachment, User, Follow, sequelize, generateSearchQuery } = require('../data/models');
const { SortParam, SearchParam, ErrorMessages, ImageType } = require('../constants');
const { ProfileCategory, FollowStatus } = require('../data/lcp');
const Cloudinary = require('../components/Cloudinary');

const main = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;
    const { id: userId } = ctx.state.user;

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const { rows: posts, count: total } = await Post.scope({
        method: ['mainPosts', userId]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ posts, _meta: pagination(total) });
};

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const { rows: posts, count: total } = await Post.scope({
        method: ['allPosts']
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ posts, _meta: pagination(total) });
};

const findOne = async ctx => {
    const { id: postId } = ctx.request.params;
    const { id: followerId } = ctx.state.user;

    const post = await Post.scope({ method: ['singlePost', followerId] }).findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_POST);
    }

    if (post.user.profileCategory === ProfileCategory.PRIVATE && followerId !== post.user.id) {
        const allowedPost = await Follow.findOne({
            where: { followerId, followingId: post.user.id, status: FollowStatus.APPROVED }
        });

        if (!allowedPost) {
            return ctx.forbidden(ErrorMessages.ALLOWED_POST);
        }
    }

    return ctx.ok({ post });
};

const getUserPosts = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;
    const { profileId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const user = await User.findByPk(profileId);

    if (user.profileCategory === ProfileCategory.PRIVATE && profileId !== userId) {
        const allowedPosts = await Follow.findOne({
            where: { followerId: userId, followingId: profileId, status: FollowStatus.APPROVED }
        });

        if (!allowedPosts) {
            return ctx.forbidden(ErrorMessages.ALLOWED_POST);
        }
    }

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const { rows: posts, count: total } = await Post.scope({
        method: ['userAllPosts', profileId]
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        limit,
        offset
    });

    return ctx.ok({ posts, _meta: pagination(total) });
};

const create = async ctx => {
    const { description, title } = ctx.request.body;
    const { id: userId } = ctx.state.user;

    const postAttachments = _.isArray(ctx.request.files?.attachments)
        ? ctx.request.files.attachments
        : [ctx.request.files?.attachments];

    if (!_.isEmpty(...postAttachments)) {
        for (const attachment of postAttachments) {
            if (!ImageType.includes(attachment.ext)) {
                return ctx.badRequest(ErrorMessages.ATTACHMENT_TYPE);
            }
        }
    }

    const postId = await sequelize.transaction(async t => {
        const newPost = await Post.create({ description, title, userId }, { transaction: t });

        if (_.isEmpty(...postAttachments)) {
            return newPost.id;
        }

        const attachments = [];

        for (const file of postAttachments) {
            const attachment = await Cloudinary.upload(file, 'attachments');

            attachments.push({
                postId: newPost.id,
                userId,
                attachmentUrl: attachment.secure_url,
                attachmentPublicId: attachment.public_id
            });
        }

        await Attachment.bulkCreate(attachments, { transaction: t });

        return newPost.id;
    });

    const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

    return ctx.created({ post });
};

const update = async ctx => {
    const { description, title, deleteAttachments } = ctx.request.body;
    const { id: postId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const newAttachments = _.isArray(ctx.request.files?.attachments)
        ? ctx.request.files.attachments
        : [ctx.request.files?.attachments];

    const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_POST);
    }

    if (post.user.id !== userId) {
        return ctx.unauthorized(ErrorMessages.POST_UPDATE_PERMISSION);
    }

    if (!description && !title && !deleteAttachments && _.isEmpty(...newAttachments)) {
        return ctx.badRequest(ErrorMessages.UPDATED_VALUES);
    }

    if (!_.isEmpty(...newAttachments)) {
        for (const attachment of newAttachments) {
            if (!ImageType.includes(attachment.ext)) {
                return ctx.badRequest(ErrorMessages.ATTACHMENT_TYPE);
            }
        }
    }

    await sequelize.transaction(async t => {
        if (title) {
            post.title = title;
        }

        if (description) {
            post.description = description;
        }

        await post.save({ transaction: t });

        if (!_.isEmpty(...newAttachments)) {
            const attachments = [];

            for (const file of newAttachments) {
                const attachment = await Cloudinary.upload(file, 'attachments');

                attachments.push({
                    postId,
                    userId,
                    attachmentUrl: attachment.secure_url,
                    attachmentPublicId: attachment.public_id
                });
            }

            await Attachment.bulkCreate(attachments, { transaction: t });
        }

        if (deleteAttachments) {
            const attachments = deleteAttachments.split(', ');

            for (const attachment of attachments) {
                await Cloudinary.delete(attachment);

                await Attachment.destroy({ where: { attachmentPublicId: attachment } }, { transaction: t });
            }
        }
    });

    const data = await Post.scope({ method: ['expand'] }).findByPk(postId);

    return ctx.ok({ post: data });
};

const remove = async ctx => {
    const { id: postId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const post = await Post.findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_POST);
    }

    if (post.userId !== userId) {
        return ctx.unauthorized(ErrorMessages.POST_DELETE_PERMISSION);
    }

    const attachments = await Attachment.findAll({ where: { postId } });

    if (attachments) {
        for (const attachment of attachments) {
            await Cloudinary.delete(attachment.attachmentPublicId);

            await Attachment.destroy({ where: { id: attachment.id } });
        }
    }

    await post.destroy();

    return ctx.noContent();
};

module.exports = {
    main,
    create,
    update,
    remove,
    findAll,
    findOne,
    getUserPosts
};
