const { Follow, User } = require('../data/models');

const getUserFollowers = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const followingId = ctx.request.params.profileId;

  const { rows: users, count: total } = await User.scope({
    method: ['followers', followingId],
  }).findAndCountAll({ offset, limit });

  return ctx.ok({
    users,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  });
};

const getUserFollowings = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const followerId = ctx.request.params.profileId;

  const { rows: users, count: total } = await User.scope({
    method: ['followings', followerId],
  }).findAndCountAll({
    offset,
    limit,
  });

  return ctx.ok({
    users,
    _meta: {
      total,
      currentPage: Math.ceil((offset + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  });
};

const create = async (ctx) => {
  const { profileId } = ctx.params;
  const userId = ctx.state.user.id;

  if (profileId === userId) {
    return ctx.badRequest({ message: `You can't follow your account` });
  }

  const isFollowed = await Follow.findOne({
    where: {
      followerId: userId,
      followingId: profileId,
    },
  });

  if (isFollowed) {
    return ctx.badRequest({
      message: `You already follow user with id ${profileId}`,
    });
  }

  await Follow.create({
    followerId: userId,
    followingId: profileId,
  });

  return ctx.created({ message: `You follow user with id: ${profileId}` });
};

const remove = async (ctx) => {
  const { profileId } = ctx.params;
  const userId = ctx.state.user.id;

  if (profileId === userId) {
    return ctx.badRequest({
      message: `You can't follow and unfollow your account`,
    });
  }

  const isFollowed = await Follow.findOne({
    where: {
      followerId: userId,
      followingId: profileId,
    },
  });

  if (!isFollowed) {
    return ctx.notFound({
      message: `You don't follow user with id ${profileId}`,
    });
  }

  await Follow.destroy({
    where: { followerId: userId, followingId: profileId },
  });

  return ctx.noContent();
};

module.exports = { getUserFollowers, getUserFollowings, create, remove };
