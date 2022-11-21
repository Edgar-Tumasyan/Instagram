const { Post, Like } = require('../data/models');

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

module.exports = { create, remove };
