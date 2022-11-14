const StatusCodes = require('http-status-codes');

const { Post, User, Attachment } = require('../data/models');
const getAttachmentsUrl = require('../helpers/getAttachmentsUrl');

const create = async (ctx) => {
  const { title, description } = ctx.request.body;

  if (!description || !title) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: 'Please provide description and title' });
  }

  const userId = ctx.state.user.id;

  const newPost = await Post.create({ title, description, userId });

  if (!ctx.request.files.attachment) {
    ctx.status = StatusCodes.CREATED;

    return (ctx.body = { post: newPost });
  }

  const attachmentsUrl = await getAttachmentsUrl(
    ctx,
    newPost.id,
    ctx.state.user.id,
    ctx.request.files.attachment
  );

  ctx.status = StatusCodes.CREATED;
  ctx.body = { post: newPost, attachments: attachmentsUrl };
};

const findAll = async (ctx) => {
  const posts = await Post.findAll({
    include: [
      {
        attributes: ['firstname', 'lastname'],
        model: User,
        as: 'user',
      },
      {
        attributes: ['attachmentUrl'],
        model: Attachment,
        as: 'attachments',
      },
    ],
  });

  ctx.status = StatusCodes.OK;
  ctx.body = { posts };
};

const findOne = async (ctx) => {
  const post = await Post.findByPk(ctx.request.params.id, {
    include: [
      {
        attributes: ['firstname', 'lastname'],
        model: User,
        as: 'user',
      },
      {
        attributes: ['attachmentUrl'],
        model: Attachment,
        as: 'attachments',
      },
    ],
  });

  if (!post) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = `No post with id ${ctx.request.params.id}`);
  }

  ctx.status = StatusCodes.OK;
  ctx.body = { post };
};

const update = async (ctx) => {
  const post = await Post.findByPk(ctx.request.params.id);

  if (!post) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = `No post with id ${ctx.request.params.id}`);
  }

  const { description, image } = ctx.request.body;

  if (!description && !image) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: 'No value to updated' });
  }

  if (description) {
    post.description = description;
  }

  if (image) {
    post.image = image;
  }

  await post.save();

  ctx.status = StatusCodes.OK;
  ctx.body = { message: post };
};

const remove = async (ctx) => {
  ctx.body = 'remove';
};

module.exports = { create, findAll, findOne, update, remove };
