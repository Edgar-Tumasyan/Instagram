const { Follow, User } = require('../data/models');
const { FollowStatus } = require('../data/lcp');

const getUserFollowers = async (ctx) => {
  const { limit, offset } = ctx.state.paginate;

  const followingId = ctx.request.params.profileId;
  const userId = ctx.state.user.id;

  const { rows: users, count: total } = await User.scope({
    method: ['followers', followingId, userId],
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
  const userId = ctx.state.user.id;

  const { rows: users, count: total } = await User.scope({
    method: ['followings', followerId, userId],
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
    raw: true,
  });

  if (isFollowed && isFollowed.status === 'approved') {
    return ctx.badRequest({
      message: `You already follow user with id ${profileId}`,
    });
  }

  if (isFollowed && isFollowed.status === 'pending') {
    return ctx.badRequest({
      message: `You have already sent request to follow user with id: ${profileId}`,
    });
  }

  const user = await User.findByPk(profileId, { raw: true });

  if (user.profileCategory === 'private') {
    await Follow.create({
      followerId: userId,
      followingId: profileId,
      status: FollowStatus.PENDING,
    });

    return ctx.created({
      message: `Your request sent user with id: ${profileId}`,
    });
  }

  await Follow.create({
    followerId: userId,
    followingId: profileId,
    status: FollowStatus.APPROVED,
  });

  return ctx.created({ message: `You follow user with id: ${profileId}` });
};

const acceptFollowInvitation = async (ctx) => {
  const followingId = ctx.state.user.id;
  const { followerId } = ctx.params;

  const isFollowed = await Follow.findOne({
    where: { followingId, followerId },
    raw: true,
  });

  if (!isFollowed) {
    return ctx.badRequest({
      message: `User with id: ${followerId} cancel follow request`,
    });
  }

  await Follow.update(
    {
      status: FollowStatus.APPROVED,
    },
    { where: { followerId, followingId } }
  );

  return ctx.ok({
    message: `You accept follow invitation user with id: ${followerId}`,
  });
};

const declineFollowInvitation = async (ctx) => {
  const followingId = ctx.state.user.id;
  const { followerId } = ctx.params;

  const isFollowed = await Follow.findOne({
    where: { followingId, followerId },
    raw: true,
  });

  if (!isFollowed) {
    return ctx.badRequest({
      message: `User with id: ${followerId} cancel follow request`,
    });
  }

  await Follow.destroy({ where: { followerId, followingId } });

  return ctx.noContent();
};

const cancelFollowInvitation = async (ctx) => {
  const followingId = ctx.params.profileId;
  const followerId = ctx.state.user.id;

  const isFollowed = await Follow.findOne({
    where: { followingId, followerId },
    raw: true,
  });

  if (!isFollowed) {
    return ctx.badRequest({
      message: `You don,t sent follow invitation user with id: ${followingId} 
      or user cancel your follow invitation`,
    });
  }

  await Follow.destroy({ where: { followerId, followingId } });

  return ctx.noContent();
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

module.exports = {
  getUserFollowers,
  getUserFollowings,
  create,
  acceptFollowInvitation,
  declineFollowInvitation,
  cancelFollowInvitation,
  remove,
};
