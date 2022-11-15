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
    userId,
    ctx.request.files.attachment
  );

  ctx.status = StatusCodes.CREATED;

  ctx.body = { post: newPost, attachments: attachmentsUrl };
};

const findAll = async (ctx) => {
  // create with scope, return posts.count, followers count
  const { limit, offset } = ctx.state.paginate;

  const { rows: posts, count: total } = await Post.findAndCountAll({
    attributes: ['id', 'description', 'title'],
    include: [
      {
        attributes: ['id', 'firstname', 'lastname'],
        model: User,
        as: 'user',
      },
      {
        attributes: ['id', 'attachmentUrl'],
        model: Attachment,
        as: 'attachments',
      },
    ],
    offset,
    limit,
    distinct: true,
  });

  ctx.status = StatusCodes.OK;
  ctx.body = {
    posts,
    _meta: {
      total,
      limit,
      currentPage: Math.ceil((Number(offset) + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  };
};

const findOne = async (ctx) => {
  const post = await Post.findByPk(ctx.request.params.id, {
    attributes: ['id', 'description', 'title'],
    include: [
      {
        attributes: ['id', 'firstname', 'lastname'],
        model: User,
        as: 'user',
      },
      {
        attributes: ['id', 'attachmentUrl'],
        model: Attachment,
        as: 'attachments',
      },
    ],
  });

  if (!post) {
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = `No post with id ${ctx.request.params.id}`);
  }

  ctx.status = StatusCodes.OK;
  ctx.body = { post };
};

const update = async (ctx) => {
  const post = await Post.findByPk(ctx.request.params.id);

  if (!post) {
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = `No post with id ${ctx.request.params.id}`);
  }

  if (post.userId !== ctx.state.user.id) {
    ctx.status = StatusCodes.UNAUTHORIZED;

    return (ctx.body = `You can update only your posts`);
  }

  const { description, title } = ctx.request.body;

  if (!description && !title) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: 'No value to updated' });
  }

  if (description) {
    post.description = description;
  }

  if (title) {
    post.title = title;
  }

  await post.save();

  ctx.status = StatusCodes.OK;

  ctx.body = { post };
};

const remove = async (ctx) => {
  // cascade
  const post = await Post.findByPk(ctx.request.params.id);

  if (!post) {
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = `No post with id ${ctx.request.params.id}`);
  }

  if (post.userId !== ctx.state.user.id) {
    ctx.status = StatusCodes.UNAUTHORIZED;

    return (ctx.body = `You can delete only your posts`);
  }

  await Post.destroy({ where: { id: post.id } });

  ctx.status = StatusCodes.OK;

  ctx.body = { message: 'Post deleted' };
};

module.exports = { create, findAll, findOne, update, remove };
