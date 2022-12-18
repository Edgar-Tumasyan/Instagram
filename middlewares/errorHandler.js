const ErrorMessages = require('../constants/ErrorMessages');

module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err);

        const errors = [];

        if (err.name === 'SequelizeUniqueConstraintError') {
            const field = err.parent.constraint.split('_')[1];
            const message = `${field} already exist`;

            return ctx.unprocessable_entity({ field, message });
        }

        if (err.name === 'SequelizeValidationError') {
            for (const error of err.errors) {
                let message = '';

                if (error.validatorKey === 'is_null') {
                    message = `${error.path} cannot be null`;
                } else if (error.validatorKey === 'len') {
                    message = `${error.path} must contain from ${error.validatorArgs[0]} to ${error.validatorArgs[1]} characters`;
                } else if (error.validatorKey === 'isEmail') {
                    message = `Email must be an email, please provide correct email address`;
                } else if (error.validatorKey === 'not_a_string') {
                    message = 'Message cannot be empty';
                }

                errors.push({ field: error.path, message });
            }

            return ctx.unprocessable_entity({ message: 'ValidationError', errors });
        }

        if (err.name === 'SequelizeDatabaseError') {
            return ctx.unprocessable_entity(ErrorMessages.UNPROCESSABLE_ENTITY);
        }

        return ctx.internalServerError();
    }
};
