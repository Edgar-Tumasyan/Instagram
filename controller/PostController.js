const StatusCodes = require('http-status-codes');
const { Post, User } = require('../data/models');
const { isValidToken } = require('../middleware/auth');

const create = async (ctx) => {
  const { description, image } = ctx.request.body;

  if (!description) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: 'Description can not be empty' });
  }

  // It's only for testing, then user_id we geting from middleware
  const token = ctx.request.headers.authorization.split(' ')[1];
  const { id } = isValidToken(token);

  let newPost = null;

  if (image) {
    newPost = await Post.create({ description, image, userId: id });
    console.log(newPost.dataValues);
  } else {
    newPost = await Post.create({ description, userId: id });
  }

  ctx.status = StatusCodes.CREATED;
  ctx.body = { post: newPost };
};

const findAll = async (ctx) => {
  const posts = await Post.findAll();

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
