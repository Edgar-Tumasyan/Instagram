const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StatusCodes = require('http-status-codes');

const register = async (ctx) => {
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
  ctx.body = { data };
};

const login = async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.status = StatusCodes.BAD_REQUEST;
    return (ctx.body = 'Please provide all values');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    ctx.status = StatusCodes.BAD_REQUEST;
    return (ctx.body = 'Please provide correct email');
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    ctx.status = StatusCodes.BAD_REQUEST;
    return (ctx.body = 'Please provide correct password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '10d' }
  );

  const { password: userPassword, ...data } = user.dataValues;

  ctx.status = StatusCodes.CREATED;
  ctx.body = { data, token };
};

const getAllUsers = async (ctx) => {
  const users = await User.findAll();
  const count = users.length;

  ctx.status = StatusCodes.OK;
  ctx.body = { count, users };
};

const getUser = async (ctx) => {
  const user = await User.findByPk(ctx.request.params.id);

  if (!user) {
    ctx.status = StatusCodes.BAD_REQUEST;
    return (ctx.body = `No user with id ${ctx.request.params.id}`);
  }

  const { password, ...data } = user.dataValues;

  ctx.status = StatusCodes.OK;
  ctx.body = { data };
};

const deleteUser = async (ctx) => {
  const user = await User.findByPk(ctx.request.params.id);

  if (!user) {
    ctx.status = StatusCodes.BAD_REQUEST;
    return (ctx.body = `No user with id ${ctx.request.params.id}`);
  }

  await User.destroy({ where: { id: ctx.request.params.id } });

  ctx.status = StatusCodes.OK;
  ctx.body = { message: 'User deleted' };
};

module.exports = { register, login, getAllUsers, getUser, deleteUser };
