const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin } = require('../../data/models');
const config = require('../../config');

const create = async ctx => {
    if (!ctx.request.body) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const { firstname, lastname, email, password } = ctx.request.body;

    if (!firstname || !lastname || !email || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({ firstname, lastname, email, password: hashPassword });

    return ctx.created({ admin: newAdmin });
};

const login = async ctx => {
    if (!ctx.request.body) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const { email, password } = ctx.request.body;

    if (!email || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, config.JWT_SECRET, {
        expiresIn: config.EXPIRES_IN
    });

    return ctx.ok({ admin, token });
};

module.exports = { login, create };
