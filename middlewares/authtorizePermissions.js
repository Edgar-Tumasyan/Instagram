const ErrorMessages = require('../constants/ErrorMessages');

const authorizePermissions = async (ctx, next) => {
    const { tokenType: role } = ctx.state.user;

    if (!role.includes('admin')) {
        return ctx.forbidden(ErrorMessages.AUTHORIZE_PERMISSIONS);
    }

    await next();
};

module.exports = authorizePermissions;
