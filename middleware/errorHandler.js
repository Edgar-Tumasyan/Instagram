const HttpStatus = require('http-status-codes');

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log();

    if (err.name === 'SequelizeDatabaseError') {
      return ctx.unprocessable_entity({
        message: 'Please provide correct values',
      });
    }

    if (err.errors[0].message === 'Validation isEmail on email failed') {
      return ctx.badRequest({
        message: 'Email must be an email, please provide correct email address',
      });
    }

    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;

    ctx.body = {
      status: ctx.status,
      name: HttpStatus.getStatusText(ctx.status),
    };
  }
};
