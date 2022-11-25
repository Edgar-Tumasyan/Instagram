const { Post, Attachment, User, Follow, sequelize } = require('../data/models');
const Cloudinary = require('../components/Cloudinary');
const _ = require('lodash');

const findAll = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const { rows: posts, count: total } = await Post.scope({
    method: ['expand'],
  }).findAndCountAll({
    offset,
    limit,
  });

  return ctx.ok({
    posts,
    _meta: {
      total,
      limit,
      pageCount: Math.ceil(total / limit),
      currentPage: Math.ceil((offset + 1) / limit) || 1,
    },
  });
};

const findOne = async (ctx) => {
  const postId = ctx.request.params.id;

  const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

  const user = await User.findByPk(post.user.id, { raw: true });

  if (user.profileCategory === 'private') {
    const allowedPost = await Follow.findOne({
      where: {
        followerId: user.id,
        followingId: post.user.id,
      },
    });

    if (!allowedPost) {
      return ctx.forbidden({
        message: `Posts of user with id: ${post.user.id} can see only followers`,
      });
    }
  }

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${postId}`,
    });
  }

  return ctx.ok({ post });
};

const getUserPosts = async (ctx) => {
  const profileId = ctx.request.params.profileId;
  const userId = ctx.state.user.id;

  const user = await User.findByPk(profileId, { raw: true });

  if (user.profileCategory === 'private') {
    const allowedPosts = await Follow.findOne({
      where: {
        followerId: userId,
        followingId: profileId,
      },
    });

    if (!allowedPosts) {
      return ctx.forbidden({
        message: `Posts of user with id: ${profileId} can see only followers`,
      });
    }
  }

  const { limit, offset } = ctx.state.paginate;

  const { rows: posts, count: total } = await Post.scope({
    method: ['userAllPosts', profileId],
  }).findAndCountAll({
    limit,
    offset,
  });

  return ctx.ok({
    posts,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  });
};

const create = async (ctx) => {
  if (!ctx.request.body) {
    return ctx.badRequest({ message: 'Please provide description and title' });
  }

  const { description, title } = ctx.request.body;

  const reqAttachments = ctx.request.files?.attachments;

  if (reqAttachments) {
    if (_.isArray(reqAttachments)) {
      for (const attachment of reqAttachments) {
        if (attachment.type !== 'image') {
          return ctx.badRequest({ message: 'Attachment must be an image' });
        }
      }
    } else {
      if (reqAttachments.type !== 'image') {
        return ctx.badRequest({ message: 'Attachment must be an image' });
      }
    }
  }

  const userId = ctx.state.user.id;

  const post = await sequelize.transaction(async (t) => {
    const newPost = await Post.create(
      { description, title, userId },
      { transaction: t }
    );

    const postId = newPost.id;

    if (!reqAttachments) {
      return await Post.scope({ method: ['expand'] }).findByPk(postId, {
        transaction: t,
      });
    }

    if (_.isArray(reqAttachments)) {
      const attachments = [];

      for (const file of reqAttachments) {
        const attachment = await Cloudinary.upload(file.path, 'attachments');

        const attachmentUrl = attachment.secure_url;
        const attachmentPublicId = attachment.public_id;

        attachments.push({
          postId,
          userId,
          attachmentUrl,
          attachmentPublicId,
        });
      }
      await Attachment.bulkCreate(attachments, { transaction: t });
    } else {
      const attachment = await Cloudinary.upload(
        reqAttachments.path,
        'attachments'
      );

      const attachmentUrl = attachment.secure_url;
      const attachmentPublicId = attachment.public_id;

      await Attachment.create(
        { postId, userId, attachmentUrl, attachmentPublicId },
        { transaction: t }
      );
    }

    return await Post.scope({ method: ['expand'] }).findByPk(postId, {
      transaction: t,
    });
  });

  return ctx.created({ post });
};

const update = async (ctx) => {
  const postId = ctx.request.params.id;

  const post = await Post.scope({ method: ['expand'] }).findByPk(postId);

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${postId}`,
    });
  }

  const userId = ctx.state.user.id;

  if (post.user.id !== userId) {
    return ctx.unauthorized({ message: `You can update only your posts` });
  }

  const attachments = ctx.request.files?.attachments;

  if (!attachments && !ctx.request.body) {
    return ctx.badRequest({ message: 'No values to updated' });
  }

  const { description, title, deleteAttachments } = ctx.request.body;

  await sequelize.transaction(async (t) => {
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

          newAttachments.push({
            postId,
            userId,
            attachmentUrl,
            attachmentPublicId,
          });
        }

        await Attachment.bulkCreate(newAttachments, { transaction: t });
      } else {
        const attachment = await Cloudinary.upload(
          attachments.path,
          'attachments'
        );

        const attachmentUrl = attachment.secure_url;
        const attachmentPublicId = attachment.public_id;

        await Attachment.create(
          { postId, userId, attachmentUrl, attachmentPublicId },
          { transaction: t }
        );
      }
    }

    if (deleteAttachments) {
      if (_.isArray(deleteAttachments)) {
        for (const attachment of deleteAttachments) {
          await Cloudinary.delete(attachment);

          await Attachment.destroy(
            { where: { attachmentPublicId: attachment } },
            { transaction: t }
          );
        }
      } else {
        await Cloudinary.delete(deleteAttachments);

        await Attachment.destroy(
          { where: { attachmentPublicId: deleteAttachments } },
          { transaction: t }
        );
      }
    }
  });

  const data = await Post.scope({ method: ['expand'] }).findByPk(postId);

  return ctx.created({ post: data });
};

const remove = async (ctx) => {
  const postId = ctx.request.params.id;

  const post = await Post.findByPk(postId);

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${postId}`,
    });
  }

  const userId = ctx.state.user.id;

  if (post.userId !== userId) {
    ctx.unauthorized({ message: `You can delete only your posts` });
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

module.exports = { findAll, findOne, getUserPosts, create, update, remove };
