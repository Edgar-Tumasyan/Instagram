const { Follow } = require('../data/models');

const getUserFollowers = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const { rows: followers, count: total } = await Follow.scope({
    method: ['userFollowers', ctx.request.params.profileId],
  }).findAndCountAll({
    limit,
    offset,
  });

  return ctx.ok({
    followers,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  });
};

const getUserFollowings = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const { rows: followings, count: total } = await Follow.scope({
    method: ['userFollowings', ctx.request.params.profileId],
  }).findAndCountAll({
    limit,
    offset,
  });

  return ctx.ok({
    followings,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  });
};

const create = async (ctx) => {
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
    return ctx.badRequest({
      message: `You already follow user with id ${profileId}`,
    });
  }

  await Follow.create({
    followerId: ctx.state.user.id,
    followingId: profileId,
  });

  return ctx.created({ message: `You follow user with id: ${profileId}` });
};

const remove = async (ctx) => {
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
    return ctx.notFound({
      message: `You don't follow user with id ${profileId}`,
    });
  }

  await Follow.destroy({
    where: { followerId: ctx.state.user.id, followingId: profileId },
  });

  return ctx.ok({ message: `You unfollow user with id: ${profileId}` });
};

module.exports = { getUserFollowers, getUserFollowings, create, remove };
