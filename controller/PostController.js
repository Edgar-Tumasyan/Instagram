const HttpStatus = require('http-status-codes');

const Cloudinary = require('../components/cloudinary');
const { Post, Attachment, sequelize } = require('../data/models');

const create = async (ctx) => {
  const reqAttachments = ctx.request.files.attachment;

  if (reqAttachments) {
    for (const attachment of reqAttachments) {
      if (!attachment.mimetype.startsWith('image')) {
        return ctx.badRequest({ message: 'Attachment must be an image' });
      }
    }
  }

  const { description, title } = ctx.request.body;

  if (!description || !title) {
    return ctx.badRequest({ message: 'Please provide description and title' });
  }

  const userId = ctx.state.user.id;

  const post = await sequelize.transaction(async (t) => {
    const newPost = await Post.create(
      { description, title, userId },
      { transaction: t }
    );

    console.log(!reqAttachments);

    if (!reqAttachments) {
      return { newPost, attachments: [] };
    }

    const postId = newPost.id;

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

    return await Post.scope({ method: ['expand'] }).findByPk(postId, {
      transaction: t,
    });
  });

  ctx.created({ post });
};

const findAll = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const { rows: posts, count: total } = await Post.scope({
    method: ['expand'],
  }).findAndCountAll({
    offset,
    limit,
  });

  ctx.ok({
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
  const post = await Post.scope({ method: ['expand'] }).findByPk(
    ctx.request.params.id
  );

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${ctx.request.params.id}`,
    });
  }

  ctx.ok({ post });
};

const update = async (ctx) => {
  const post = await Post.scope({ method: ['expand'] }).findByPk(
    ctx.request.params.id
  );

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${ctx.request.params.id}`,
    });
  }

  if (post.user.id !== ctx.state.user.id) {
    return ctx.unauthorized({ message: `You can update only your posts` });
  }

  const { description, title, deleteAttachments } = ctx.request.body;

  const newAttachments = ctx.request.files?.newAttachments;

  if (!description && !title && !newAttachments && !deleteAttachments) {
    return ctx.badRequest({ message: 'No values to updated' });
  }

  await sequelize.transaction(async (t) => {
    if (title) {
      post.title = title;
    }

    if (description) {
      post.description = description;
    }

    await post.save({ transaction: t });

    if (newAttachments) {
      const attachments = [];

      for (const file of newAttachments) {
        const attachment = await Cloudinary.upload(file.path, 'attachments');

        const attachmentUrl = attachment.secure_url;

        const attachmentPublicId = attachment.public_id;

        attachments.push({
          postId: post.id,
          userId: ctx.state.user.id,
          attachmentUrl,
          attachmentPublicId,
        });
      }

      await Attachment.bulkCreate(attachments, { transaction: t });
    }

    if (deleteAttachments) {
      for (const attachment of deleteAttachments) {
        await Cloudinary.delete(attachment);

        await Attachment.destroy(
          { where: { attachmentPublicId: attachment } },
          { transaction: t }
        );
      }
    }
  });

  const data = await Post.scope({ method: ['expand'] }).findByPk(post.id);

  ctx.created({ post: data });
};

const remove = async (ctx) => {
  const post = await Post.findByPk(ctx.request.params.id);

  if (!post) {
    return ctx.notFound({
      message: `No post with id ${ctx.request.params.id}`,
    });
  }

  if (post.userId !== ctx.state.user.id) {
    ctx.status = HttpStatus.UNAUTHORIZED;

    return (ctx.body = { message: `You can delete only your posts` });
  }

  await Post.destroy({ where: { id: post.id } });

  ctx.noContent();
};

module.exports = { create, findAll, findOne, update, remove };
