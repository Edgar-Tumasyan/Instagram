const jwt = require('jsonwebtoken');
const { User } = require('../data/models');
const StatusCodes = require('http-status-codes');

const isValidToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const authenticateUser = async (ctx, next) => {
  await next();
  const authHead = ctx.request.headers.authorization;

  if (!authHead) {
    ctx.status = StatusCodes.UNAUTHORIZED;
    return (ctx.body = { message: 'Unauthorized to access this route' });
  }

  const token = authHead.split(' ')[1];
  const validToken = isValidToken(token);

  if (!validToken) {
    ctx.status = StatusCodes.UNAUTHORIZED;
    return (ctx.body = { message: 'Token invalid' });
  }

  const { id, email, role } = validToken;

  // ctx.stat.user = { id, email, role };
};

module.exports = { authenticateUser, isValidToken };
