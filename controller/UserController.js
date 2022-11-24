const Cloudinary = require('../components/Cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User, Follow } = require('../data/models');
const config = require('../config');

//create user update functionality

const findAll = async (ctx) => {
  const userId = ctx.state.user.id;

  const { limit, offset } = ctx.state.paginate;

  const { rows: users, count: total } = await User.scope({
    method: ['profiles', userId],
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

const findOne = async (ctx) => {
  const profileId = ctx.request.params.id;
  const userId = ctx.state.user.id;

  const user = await User.scope({
    method: ['profile', profileId, userId],
  }).findByPk(profileId);

  if (!user) {
    return ctx.notFound({
      message: `No user with id ${profileId}`,
    });
  }

  const followed = await Follow.findOne({
    where: { followerId: userId, followingId: profileId },
  });

  if (!followed) {
    return ctx.ok({ user, followed: false });
  }

  return ctx.ok({ user, followed: true });
};

const create = async (ctx) => {
  const { firstname, lastname, email, password } = ctx.request.body;

  if (!firstname || !lastname || !email || !password) {
    return ctx.badRequest({ message: 'Please provide all values' });
  }

  const existingEmail = await User.findOne({ where: { email } });

  if (existingEmail) {
    return ctx.badRequest({ message: `Email ${email} already exist` });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    firstname,
    lastname,
    email,
    password: hashPassword,
  });

  return ctx.created({ user: newUser });
};

const login = async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    return ctx.badRequest({ message: 'Please provide all values' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return ctx.notFound({ message: 'Invalid Credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.EXPIRES_IN }
  );

  ctx.ok({ user, token });
};

const uploadAvatar = async (ctx) => {
  const reqAvatar = ctx.request.files?.avatar;

  if (!reqAvatar) {
    return ctx.badRequest({
      message: 'Please choose your avatar',
    });
  }

  if (_.isArray(reqAvatar)) {
    return ctx.badRequest({ message: 'Please choose one photo' });
  }

  if (reqAvatar.type !== 'image') {
    return ctx.badRequest({ message: 'Avatar must be an image' });
  }

  const avatar = await Cloudinary.upload(reqAvatar.path, 'avatars');

  const id = ctx.state.user.id;

  await User.update(
    { avatar: avatar.secure_url, avatarPublicId: avatar.public_id },
    {
      where: {
        id,
      },
    }
  );

  const user = await User.scope({ method: ['profile'] }).findByPk(id);

  return ctx.created({ user });
};

const changeProfileCategory = async (ctx) => {
  const id = ctx.state.user.id;

  const { profileCategory } = ctx.request.body;

  if (!profileCategory) {
    return ctx.badRequest({
      message: 'Please choose your profile category that you want to change',
    });
  }

  await User.update({ profileCategory }, { where: { id } });

  const user = await User.findByPk(id);

  ctx.body = { user };
};

const remove = async (ctx) => {
  const id = ctx.state.user.id;

  const user = await User.findByPk(id);

  if (!user) {
    return ctx.notFound({ message: `No user with id: ${id}` });
  }

  if (user.avatar) {
    await Cloudinary.delete(user.avatarPublicId);
  }

  await User.destroy({ where: { id } });

  ctx.noContent();
};

module.exports = {
  findAll,
  findOne,
  create,
  login,
  uploadAvatar,
  changeProfileCategory,
  remove,
};
