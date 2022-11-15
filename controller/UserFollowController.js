const StatusCodes = require('http-status-codes');

const { Follow } = require('../data/models');

const follow = async (ctx) => {
  const { profileId } = ctx.params;

  if (profileId === ctx.state.user.id) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: `You can't follow your account` });
  }

  const isFollowed = await Follow.findOne({
    where: {
      followerId: ctx.state.user.id,
      followingId: profileId,
    },
  });

  if (isFollowed) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = {
      message: `You already follow user with id ${profileId}`,
    });
  }

  await Follow.create({
    followerId: ctx.state.user.id,
    followingId: profileId,
  });

  ctx.status = StatusCodes.CREATED;

  ctx.body = { message: `You follow user with id: ${profileId}` };
};

const unfollow = async (ctx) => {
  const { profileId } = ctx.params;

  if (profileId === ctx.state.user.id) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = {
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
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = {
      message: `You don't follow user with id ${profileId}`,
    });
  }

  await Follow.destroy({
    where: { followerId: ctx.state.user.id, followingId: profileId },
  });

  ctx.status = StatusCodes.OK;

  return (ctx.body = { message: `You unfollow user with id: ${profileId}` });
};

module.exports = { follow, unfollow };
