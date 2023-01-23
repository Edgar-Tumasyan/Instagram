const ErrorMessages = require('../constants/ErrorMessages');

const acl = roles => async (ctx, next) => {
    const { tokenType: role } = ctx.state.user;

    if (!roles.includes(role)) {
        return ctx.forbidden(ErrorMessages.AUTHORIZE_PERMISSIONS);
    }

    await next();
};

module.exports = acl;
