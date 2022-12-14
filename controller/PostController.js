const _ = require('lodash');

const { Post, Attachment, User, Follow, sequelize } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const Cloudinary = require('../components/Cloudinary');

const main = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { rows: posts, count: total } = await Post.scope({ method: ['mainPosts'] }).findAndCountAll({
        offset,
        limit
    });

    return ctx.ok({
        posts,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

const findAll = async ctx => {
    const { limit, offset } = ctx.state.paginate;

    const { rows: posts, count: total } = await Post.scope({ method: ['allPosts'] }).findAndCountAll({ offset, limit });

    return ctx.ok({
        posts,
        _meta: {
            total,
            limit,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
};

const findOne = async ctx => {
    const { id: postId } = ctx.request.params;

    const { id: followerId } = ctx.state.user;

    const post = await Post.scope({ method: ['singlePost', followerId] }).findByPk(postId);

    if (!post) {
        return ctx.notFound(ErrorMessages.NO_POST + ` ${postId}`);
    }

    if (post.user.profileCategory === 'private' && followerId !== post.user.id) {
        const allowedPost = await Follow.findOne({
            where: { followerId, followingId: post.user.id, status: 'approved' }
        });

        if (!allowedPost) {
            return ctx.forbidden(ErrorMessages.ALLOWED_POST);
        }
    }

    return ctx.ok({ post });
};

const getUserPosts = async ctx => {
    const { profileId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const user = await User.findByPk(profileId, { raw: true });

    if (user.profileCategory === 'private' && profileId !== userId) {
        const allowedPosts = await Follow.findOne({
            where: { followerId: userId, followingId: profileId, status: 'approved' }
        });

        if (!allowedPosts) {
            return ctx.forbidden(ErrorMessages.ALLOWED_POST);
        }
    }

    const { limit, offset } = ctx.state.paginate;

    const { rows: posts, count: total } = await Post.scope({ method: ['userAllPosts', profileId] }).findAndCountAll({
        limit,
        offset
    });

    return ctx.ok({
        posts,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

const create = async ctx => {
    if (!ctx.request.body) {
        return ctx.badRequest(ErrorMessages.POST_VALUES);
    }

    const { description, title } = ctx.request.body;

    if (!description || !title) {
        return ctx.badRequest(ErrorMessages.POST_VALUES);
    }

    const reqAttachments = ctx.request.files?.attachments;

    if (reqAttachments) {
        if (_.isArray(reqAttachments)) {
            for (const attachment of reqAttachments) {
                if (attachment.type !== 'image') {
                    return ctx.badRequest(ErrorMessages.ATTACHMENT_TYPE);
                }
            }
        } else {
            if (reqAttachments.type !== 'image') {
                return ctx.badRequest(ErrorMessages.ATTACHMENT_TYPE);
            }
        }
    }

    const { id: userId } = ctx.state.user;

    const postId = await sequelize.transaction(async t => {
        const newPost = await Post.create({ description, title, userId }, { transaction: t });

        if (!reqAttachments) {
            return newPost.id;
        }

        if (_.isArray(reqAttachments)) {
            const attachments = [];

            for (const file of reqAttachments) {
                const attachment = await Cloudinary.upload(file.path, 'attachments');

                const attachmentUrl = attachment.secure_url;
                const attachmentPublicId = attachment.public_id;

                attachments.push({ postId: newPost.id, userId, attachmentUrl, attachmentPublicId });
            }

            await Attachment.bulkCreate(attachments, { transaction: t });
        } else {
            const attachment = await Cloudinary.upload(reqAttachments.path, 'attachments');

            const attachmentUrl = attachment.secure_url;
            const attachmentPublicId = attachment.public_id;

            await Attachment.create({ postId: newPost.id, userId, attachmentUrl, attachmentPublicId }, { transaction: t });
        }

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

    const attachments = ctx.request.files?.attachments;

    if (!attachments && !ctx.request.body) {
        return ctx.badRequest(ErrorMessages.UPDATED_VALUES);
    }

    const { description, title, deleteAttachments } = ctx.request.body;

    await sequelize.transaction(async t => {
        if (title) {
            post.title = title;
        }

        if (description) {
            post.description = description;
        }

        await post.save({ transaction: t });

        if (attachments) {
            if (_.isArray(attachments)) {
                const newAttachments = [];

                for (const file of attachments) {
                    const attachment = await Cloudinary.upload(file.path, 'attachments');

                    const attachmentUrl = attachment.secure_url;
                    const attachmentPublicId = attachment.public_id;

                    newAttachments.push({ postId, userId, attachmentUrl, attachmentPublicId });
                }

                await Attachment.bulkCreate(newAttachments, { transaction: t });
            } else {
                const attachment = await Cloudinary.upload(attachments.path, 'attachments');

                const attachmentUrl = attachment.secure_url;
                const attachmentPublicId = attachment.public_id;

                await Attachment.create({ postId, userId, attachmentUrl, attachmentPublicId }, { transaction: t });
            }
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

    console.log(post.userId, userId);

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
