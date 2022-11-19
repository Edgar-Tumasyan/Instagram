const { Post, Like } = require('../data/models');

const likePost = async (ctx) => {
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

  await Post.increment('likesCount', { where: { id: postId } });

  const data = await Post.scope({ method: ['expand'] }).findByPk(postId);

  ctx.created({ post: data });
};

const dislike = async (ctx) => {
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

  await Post.decrement('likesCount', { where: { id: postId } });

  ctx.noContent();
};

module.exports = { likePost, dislike };
