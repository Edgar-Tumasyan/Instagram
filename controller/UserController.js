const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StatusCodes = require('http-status-codes');
const cloudinary = require('cloudinary').v2;
const { Sequelize } = require('sequelize');

const { User, Post, Attachment, Follow } = require('../data/models');
const config = require('../config');

const create = async (ctx) => {
  const { firstname, lastname, email, password } = ctx.request.body;

  if (!firstname || !lastname || !email || !password) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = 'Please provide all values');
  }

  const existingEmail = await User.findOne({ where: { email } });

  if (existingEmail) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = `Email ${email} already exist`);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    firstname,
    lastname,
    email,
    password: hashPassword,
  });

  const { password: userPassword, ...data } = newUser.dataValues;

  ctx.status = StatusCodes.CREATED;
  ctx.body = { user: data };
};

const login = async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = 'Please provide all values');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = 'Please provide correct email');
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = 'Please provide correct password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.TOKEN_EXPIRESIN }
  );

  const { password: userPassword, ...data } = user.dataValues;

  ctx.status = StatusCodes.CREATED;

  ctx.body = { user: data, token };
};

const uploadAvatar = async (ctx) => {
  const reqAvatar = ctx.request.files.avatar;

  if (!reqAvatar || !reqAvatar[0].mimetype.startsWith('image')) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = {
      message: 'Please choose your avatar, that should be an image',
    });
  }

  if (reqAvatar.length > 1) {
    ctx.status = StatusCodes.BAD_REQUEST;

    return (ctx.body = { message: 'Please choose one photo' });
  }

  const avatar = await cloudinary.uploader.upload(reqAvatar[0].path, {
    use_filename: true,
    folder: 'avatars',
  });

  console.log(avatar.secure_url);

  await User.update(
    { avatar: avatar.secure_url },
    {
      where: {
        id: ctx.state.user.id,
      },
    }
  );

  const { password, email, createdAt, updatedAt, ...data } = ctx.state.user;

  ctx.status = StatusCodes.CREATED;

  ctx.body = { user: data };
};

const findAll = async (ctx) => {
  // create with scope, return posts.count, followers count
  const { limit, offset } = ctx.state.paginate;

  const { rows: users, count: total } = await User.findAndCountAll({
    attributes: ['id', 'firstname', 'lastname'],
    include: [
      {
        //
        // attributes: {
        //   include: [
        //     [
        //       // Note the wrapping parentheses in the call below!
        //       Sequelize.literal(`(
        //             SELECT COUNT(*)
        //             FROM posts AS post
        //             WHERE
        //                 post.userId = user.id
        //
        //         )`),
        //       'postsCount',
        //     ],
        //   ],
        // },
        //
        model: Post,
        as: 'posts',
      },
      // {
      //   attributes: ['followerId'],
      //   model: Follow,
      //   as: 'followers',
      //   include: [
      //     {
      //       attributes: ['firstname', 'lastname'],
      //       model: User,
      //       as: 'user',
      //     },
      //   ],
      // },
    ],
    offset,
    limit,
    distinct: true,
  });

  ctx.status = StatusCodes.OK;
  ctx.body = {
    users,
    _meta: {
      total,
      limit,
      currentPage: Math.ceil((Number(offset) + 1) / limit) || 1,
      pageCount: Math.ceil(total / limit),
    },
  };
};

const findOne = async (ctx) => {
  const user = await User.findByPk(ctx.request.params.id, {
    attributes: ['id', 'firstname', 'lastname'],
    include: [
      {
        model: Post,
        as: 'posts',
      },
    ],
  });

  if (!user) {
    ctx.status = StatusCodes.NOT_FOUND;

    return (ctx.body = `No user with id ${ctx.request.params.id}`);
  }

  ctx.status = StatusCodes.OK;
  ctx.body = { user };
};

const remove = async (ctx) => {
  // create cascade
  if (ctx.state.user.id !== ctx.request.params.id) {
    ctx.status = StatusCodes.UNAUTHORIZED;

    return (ctx.body = `You can delete only your account`);
  }

  await User.destroy({ where: { id: ctx.state.user.id } });

  ctx.status = StatusCodes.OK;
  ctx.body = { message: 'User deleted' };
};

module.exports = { create, login, uploadAvatar, findAll, findOne, remove };
