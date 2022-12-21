const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin } = require('../../data/models');

const create = async ctx => {
    const { firstname, lastname, email, password } = ctx.request.body;

    const newAdmin = await Admin.create({ firstname, lastname, email, password });

    return ctx.created({ admin: newAdmin });
};

const login = async ctx => {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await admin.comparePassword(password, admin.password))) {
        return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
    }

    return ctx.ok({ admin, token: admin.generateToken('admin') });
};

module.exports = { login, create };
