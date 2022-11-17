const { Follow } = require('../data/models');

const follow = async (ctx) => {
  const { profileId } = ctx.params;

  if (profileId === ctx.state.user.id) {
    return ctx.badRequest({ message: `You can't follow your account` });
  }

  const isFollowed = await Follow.findOne({
    where: {
      followerId: ctx.state.user.id,
      followingId: profileId,
    },
  });

  if (isFollowed) {
    ctx.badRequest({
      message: `You already follow user with id ${profileId}`,
    });
  }

  await Follow.create({
    followerId: ctx.state.user.id,
    followingId: profileId,
  });

  ctx.created({ message: `You follow user with id: ${profileId}` });
};

const unfollow = async (ctx) => {
  const { profileId } = ctx.params;

  if (profileId === ctx.state.user.id) {
    return ctx.badRequest({
      message: `You can't follow and unfollow your account`,
    });
  }

  const isFollowed = await Follow.findOne({
    where: {
      followerId: ctx.state.user.id,
      followingId: profileId,
    },
  });

  if (!isFollowed) {
    ctx.notFound({
      message: `You don't follow user with id ${profileId}`,
    });
  }

  await Follow.destroy({
    where: { followerId: ctx.state.user.id, followingId: profileId },
  });

  ctx.ok({ message: `You unfollow user with id: ${profileId}` });
};

module.exports = { follow, unfollow };
