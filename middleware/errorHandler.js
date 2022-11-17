const HttpStatus = require('http-status-codes');

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);

    if (err.name === 'SequelizeDatabaseError') {
      ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;

      return (ctx.body = {
        status: ctx.status,
        message: 'Please provide correct values',
      });
    }

    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;

    ctx.body = {
      status: ctx.status,
      name: HttpStatus.getStatusText(ctx.status),
    };
  }
};
