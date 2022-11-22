const { Post, Like, User } = require('../data/models');

const postLikesUsers = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const postId = ctx.request.params.postId;

  const { rows: users, count: total } = await User.scope({
    method: ['likesUsers', postId],
  }).findAndCountAll({ limit, offset });

  ctx.body = {
    users,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  };
};

const create = async (ctx) => {
  const { postId } = ctx.params;

  const post = await Post.findByPk(postId);

  if (!post) {
    return ctx.badRequest({ message: `No post with id: ${postId}` });
  }

  const userId = ctx.state.user.id;

  const existingLike = await Like.findOne({
    where: { postId, userId },
  });

  if (existingLike) {
    return ctx.badRequest({ message: `You already like this post` });
  }

  await Like.create({ userId, postId });

  const data = await Post.scope({ method: ['expand'] }).findByPk(postId);

  return ctx.created({ post: data });
};

const remove = async (ctx) => {
  const { postId } = ctx.params;

  const post = await Post.findByPk(postId);

  if (!post) {
    return ctx.badRequest({ message: `No post with id: ${postId}` });
  }

  const userId = ctx.state.user.id;

  const existingLike = await Like.findOne({
    where: { postId, userId },
  });

  if (!existingLike) {
    return ctx.badRequest({ message: `You don't like this post` });
  }

  await Like.destroy({ where: { userId, postId } });

  return ctx.noContent();
};

module.exports = { postLikesUsers, create, remove };
