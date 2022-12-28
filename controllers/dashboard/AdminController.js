const _ = require('lodash');

const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin, User, Post } = require('../../data/models');
const { Helpers, SendEmail } = require('../../components');
const config = require('../../config');

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

const homePage = async ctx => {
    const currentYear = new Date().getFullYear();
    const lastYear = new Date().getFullYear() - 1;

    const usersHomePage = await User.scope({ method: ['homePage', lastYear, currentYear] }).findAll({ raw: true });
    const postsHomePage = await Post.scope({ method: ['homePage', lastYear, currentYear] }).findAll({ raw: true });

    const users = await Helpers.homePageNormalizer(usersHomePage);
    const posts = await Helpers.homePageNormalizer(postsHomePage);

    return ctx.ok({ users, posts });
};

/// //////////////////////////////////
const forgotPassword = async ctx => {
    const { email: userEmail } = ctx.state.user;
    const { email } = ctx.request.body;

    const user = await User.findOne({ where: { email } });

    if (!user || email !== userEmail) {
        return ctx.badRequest(ErrorMessages.FORGOT_PASSWORD_INCORRECT_EMAIL);
    }

    const passwordToken = await Helpers.passwordToken(user);
    const resetUrl = `${config.API_URL}/users/reset-password?email=${email}&token=${passwordToken}`;

    await SendEmail(email, config.SENDER_EMAIL, resetUrl, 'Reset Password');

    user.passwordToken = passwordToken;

    await user.save();

    return ctx.ok({ message: 'Please check your email for reset password link', resetUrl });
};

const resetPassword = async ctx => {
    const { password } = ctx.request.body;
    const { email, token } = ctx.query;

    const user = await User.findOne({ where: { email } });

    if (
        !email ||
        !token ||
        !password ||
        _.isNull(user.dataValues.passwordToken) ||
        !(await Helpers.verifyToken(token, config.JWT_SECRET_RESET_PASSWORD))
    ) {
        return ctx.unauthorized(ErrorMessages.UNPROCESSABLE_ENTITY);
    }

    user.password = password;
    user.passwordToken = null;

    await user.save();

    return ctx.created({ user });
};

const changePassword = async ctx => {
    const { oldPassword, newPassword } = ctx.request.body;
    const { id } = ctx.state.user;

    if (!oldPassword || !newPassword) {
        return ctx.badRequest(ErrorMessages.CHANGE_PASSWORD);
    }

    const user = await User.findByPk(id);

    if (!user || !(await user.comparePassword(oldPassword, user.dataValues.password))) {
        return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
    }

    user.password = newPassword;

    await user.save();

    return ctx.created({ user });
};

module.exports = { login, create, homePage, forgotPassword, resetPassword, changePassword };
