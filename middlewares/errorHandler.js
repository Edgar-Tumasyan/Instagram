module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err);

        const errors = [];

        if (err.name === 'SequelizeUniqueConstraintError') {
            const field = err.parent.constraint.split('_')[1];
            const message = `${field} already exist`;

            errors.push({ field, message });

            return ctx.unprocessable_entity({ message: 'UniqueConstraintError', errors });
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
            const message = 'Incorrect values';

            errors.push({ message });

            return ctx.unprocessable_entity({ message: 'DatabaseError', errors });
        }

        if (err.name === 'TokenExpiredError') {
            const message = 'Your token has expired';

            errors.push({ message });

            return ctx.unauthorized({ message: 'TokenExpiredError', errors });
        }

        if (err.name === 'JsonWebTokenError') {
            const message = 'Invalid token';

            errors.push({ message });

            return ctx.unauthorized({ message: err.name, errors });
        }

        return ctx.internalServerError();
    }
};
