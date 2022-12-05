const ErrorMessages = require('../constants/ErrorMessages');

module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);

        if (err.name === 'SequelizeDatabaseError') {
            return ctx.unprocessable_entity(ErrorMessages.UNPROCESSABLE_ENTITY);
        }

        if (err.errors[0].message === 'Validation isEmail on email failed') {
            return ctx.badRequest(ErrorMessages.CORRECT_EMAIL);
        }

        return ctx.internalServerError();
    }
};
