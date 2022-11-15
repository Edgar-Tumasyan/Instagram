module.exports = async (ctx, next) => {
  let { limit, offset } = ctx.query;

  if (!limit || limit <= 0) {
    limit = 2;
  }

  if (!offset) {
    offset = 0;
  }

  limit = parseInt(limit);
  offset = parseInt(offset);

  ctx.state.paginate = { limit, offset };

  await next();
};
