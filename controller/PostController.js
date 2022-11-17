const HttpStatus = require('http-status-codes');

const Cloudinary = require('../components/cloudinary');
const { Post, Attachment, sequelize } = require('../data/models');

const create = async (ctx) => {
  const reqAttachments = ctx.request.files.attachment;

  if (reqAttachments) {
    for (const attachment of reqAttachments) {
      if (!attachment.mimetype.startsWith('image')) {
        ctx.status = HttpStatus.BAD_REQUEST;

        return (ctx.body = { message: 'Attachment must be an image' });
      }
    }
  }

  const { description, title } = ctx.request.body;

  if (!description || !title) {
    ctx.status = HttpStatus.BAD_REQUEST;

    return (ctx.body = { message: 'Please provide description and title' });
  }

  const userId = ctx.state.user.id;

  const post = await sequelize.transaction(async (t) => {
    const newPost = await Post.create(
      { description, title, userId },
      { transaction: t }
    );

    if (!reqAttachments) {
      ctx.status = HttpStatus.CREATED;

      return (ctx.body = { post: newPost, attachments: [] });
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

  ctx.status = HttpStatus.CREATED;

  ctx.body = { post };
};

const findAll = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const { rows: posts, count: total } = await Post.scope({
    method: ['expand'],
  }).findAndCountAll({
    offset,
    limit,
  });

  ctx.status = HttpStatus.OK;
  ctx.body = {
    posts,
    _meta: {
      total,
      limit,
      pageCount: Math.ceil(total / limit),
      currentPage: Math.ceil((offset + 1) / limit) || 1,
    },
  };
};

const findOne = async (ctx) => {
  const post = await Post.scope({ method: ['expand'] }).findByPk(
    ctx.request.params.id
  );

  if (!post) {
    ctx.status = HttpStatus.NOT_FOUND;

    return (ctx.body = { message: `No post with id ${ctx.request.params.id}` });
  }

  ctx.status = HttpStatus.OK;
  ctx.body = { post };
};

const update = async (ctx) => {
  const post = await Post.scope({ method: ['expand'] }).findByPk(
    ctx.request.params.id
  );

  if (!post) {
    ctx.status = HttpStatus.NOT_FOUND;

    return (ctx.body = {
      message: `No post with id ${ctx.request.params.id}`,
    });
  }

  if (post.user.id !== ctx.state.user.id) {
    ctx.status = HttpStatus.UNAUTHORIZED;

    return (ctx.body = { message: `You can update only your posts` });
  }

  const { description, title, deleteAttachments } = ctx.request.body;

  const newAttachments = ctx.request.files.newAttachments;

  if (!description && !title && !newAttachments && !deleteAttachments) {
    ctx.status = HttpStatus.BAD_REQUEST;

    return (ctx.body = { message: 'No value to updated' });
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

  ctx.status = HttpStatus.CREATED;

  ctx.body = { post: data };
};

const remove = async (ctx) => {
  // cascade
  const post = await Post.findByPk(ctx.request.params.id);

  if (!post) {
    ctx.status = HttpStatus.NOT_FOUND;

    return (ctx.body = { message: `No post with id ${ctx.request.params.id}` });
  }

  if (post.userId !== ctx.state.user.id) {
    ctx.status = HttpStatus.UNAUTHORIZED;

    return (ctx.body = { message: `You can delete only your posts` });
  }

  await Post.destroy({ where: { id: post.id } });

  ctx.status = HttpStatus.NO_CONTENT;

  ctx.body = {};
};

module.exports = { create, findAll, findOne, update, remove };
