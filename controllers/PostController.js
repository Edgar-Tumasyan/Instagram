const _ = require('lodash');
const { literal } = require('sequelize');

const { Post, Attachment, User, Follow, sequelize, generateSearchQuery } = require('../data/models');
const { SortParam, SearchParam, ErrorMessages, ImageType } = require('../constants');
const Cloudinary = require('../components/cloudinary');

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
        return ctx.notFound(ErrorMessages.NO_POST + ` ${postId}`);
    }

    if (post.user.profileCategory === 'private' && followerId !== post.user.id) {
        const allowedPost = await Follow.findOne({ where: { followerId, followingId: post.user.id, status: 'approved' } });

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

    const user = await User.findByPk(profileId, { raw: true });

    if (user.profileCategory === 'private' && profileId !== userId) {
        const allowedPosts = await Follow.findOne({ where: { followerId: userId, followingId: profileId, status: 'approved' } });

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

    const postAttachments = _.isArray(ctx.request.files?.attachments)
        ? ctx.request.files.attachments
        : [ctx.request.files?.attachments];

    if (!_.isUndefined(...postAttachments)) {
        for (const attachment of postAttachments) {
            if (!ImageType.includes(attachment.ext)) {
                return ctx.badRequest(ErrorMessages.ATTACHMENT_TYPE);
            }
        }
    }

    const { id: userId } = ctx.state.user;

    const postId = await sequelize.transaction(async t => {
        const newPost = await Post.create({ description, title, userId }, { transaction: t });

        if (_.isUndefined(...postAttachments)) {
            return newPost.id;
        }

        const attachments = [];

        for (const file of postAttachments) {
            const attachment = await Cloudinary.upload(file, 'attachments');

            const attachmentUrl = attachment.secure_url;
            const attachmentPublicId = attachment.public_id;

            attachments.push({ postId: newPost.id, userId, attachmentUrl, attachmentPublicId });
        }

        await Attachment.bulkCreate(attachments, { transaction: t });

        return newPost.id;
    });

    const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

    return ctx.created({ post });
};

const update = async ctx => {
    const { id: postId } = ctx.request.params;

    const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NO_POST + `${postId}`);
    }

    const { id: userId } = ctx.state.user;

    if (post.user.id !== userId) {
        return ctx.unauthorized(ErrorMessages.POST_UPDATE_PERMISSION);
    }

    const { description, title, deleteAttachments } = ctx.request.body;

    const newAttachments = _.isArray(ctx.request.files?.attachments)
        ? ctx.request.files.attachments
        : [ctx.request.files?.attachments];

    if (!description && !title && !deleteAttachments && _.isUndefined(...newAttachments)) {
        return ctx.badRequest(ErrorMessages.UPDATED_VALUES);
    }

    if (!_.isUndefined(...newAttachments)) {
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

        if (!_.isUndefined(...newAttachments)) {
            const attachments = [];

            for (const file of newAttachments) {
                const attachment = await Cloudinary.upload(file, 'attachments');

                const attachmentUrl = attachment.secure_url;
                const attachmentPublicId = attachment.public_id;

                attachments.push({ postId, userId, attachmentUrl, attachmentPublicId });
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

    const post = await Post.findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NO_POST + ` ${postId}`);
    }

    const { id: userId } = ctx.state.user;

    if (post.userId !== userId) {
        return ctx.unauthorized(ErrorMessages.POST_DELETE_PERMISSION);
    }

    const attachments = await Attachment.findAll({ where: { postId } });

    if (attachments) {
        for (const attachment of attachments) {
            await Cloudinary.delete(attachment.dataValues.attachmentPublicId);

            await Attachment.destroy({ where: { id: attachment.dataValues.id } });
        }
    }

    await Post.destroy({ where: { id: postId } });

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
