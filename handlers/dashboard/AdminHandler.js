const _ = require('lodash');

const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin, User, Post, generateSearchQuery } = require('../../data/models');
const { Helpers, SendEmail, Cloudinary } = require('../../components');
const config = require('../../config');
const validator = require('validator');
const { SortParam, SearchParam, ImageType } = require('../../constants');
const { literal } = require('sequelize');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;

    const sortKey = SortParam.ADMIN[sortField] ? SortParam.ADMIN[sortField] : SortParam.ADMIN.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const { rows: users, count: total } = await Admin.scope({ method: ['profiles'] }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const findOne = async ctx => {
    let { id } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    if (id === 'me') {
        id = userId;
    }

    const admin = await Admin.scope({ method: ['profiles'] }).findByPk(id);

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_ADMIN);
    }

    return ctx.ok({ admin });
};

const statistics = async ctx => {
    const currentYear = new Date().getFullYear();
    const lastYear = new Date().getFullYear() - 1;

    const usersStatistics = await User.scope({ method: ['statistics', lastYear, currentYear] }).findAll({ raw: true });
    const postsStatistics = await Post.scope({ method: ['statistics', lastYear, currentYear] }).findAll({ raw: true });

    const users = await Helpers.statisticsNormalizer(usersStatistics);
    const posts = await Helpers.statisticsNormalizer(postsStatistics);

    return ctx.ok({ users, posts });
};

const create = async ctx => {
    const { firstname, lastname, email, password } = ctx.request.body;

    const admin = await Admin.create({ firstname, lastname, email, password });

    return ctx.created({ admin });
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

const update = async ctx => {
    const { firstname, lastname, email } = ctx.request.body;
    const { id } = ctx.state.user;

    if (!firstname && !lastname && !email) {
        return ctx.badRequest(ErrorMessages.UPDATED_VALUES);
    }

    const admin = await Admin.scope({ method: ['profiles'] }).findByPk(id);

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_ADMIN);
    }

    if (firstname) {
        admin.firstname = firstname;
    }

    if (lastname) {
        admin.lastname = lastname;
    }

    if (email) {
        admin.email = email;
    }

    await admin.save();

    return ctx.ok({ admin });
};

const uploadAvatar = async ctx => {
    const reqAvatar = ctx.request.files?.avatar;
    const { id } = ctx.state.user;

    if (!reqAvatar) {
        return ctx.badRequest(ErrorMessages.MISSING_AVATAR);
    }

    if (_.isArray(reqAvatar)) {
        return ctx.badRequest(ErrorMessages.MANY_AVATARS);
    }

    if (!ImageType.includes(reqAvatar.ext)) {
        return ctx.badRequest(ErrorMessages.AVATAR_TYPE);
    }

    const avatar = await Cloudinary.upload(reqAvatar, 'avatars');

    await Admin.update({ avatar: avatar.secure_url, avatarPublicId: avatar.public_id }, { where: { id } });

    const admin = await Admin.scope({ method: ['profiles'] }).findByPk(id);

    return ctx.created({ admin });
};

const forgotPassword = async ctx => {
    const { email } = ctx.request.body;

    if (!email || !validator.isEmail(email)) {
        return ctx.badRequest(ErrorMessages.FORGOT_PASSWORD_EMAIL);
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_ADMIN);
    }

    const passwordToken = await Helpers.passwordToken(admin);
    const resetUrl = `${config.API_URL}/dashboard/admins/reset-password?email=${email}&token=${passwordToken}`;

    await SendEmail(email, config.SENDER_EMAIL, resetUrl, 'Reset Password');

    admin.passwordToken = passwordToken;

    await admin.save();

    // return resetUrl only for testing in postman
    return ctx.ok({ message: 'Please check your email for reset password link', resetUrl });
};

const resetPassword = async ctx => {
    const { password } = ctx.request.body;
    const { email, token } = ctx.query;

    if (!email || !token || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_ADMIN);
    }

    if (_.isNull(admin.passwordToken) || token !== admin.passwordToken) {
        return ctx.badRequest(ErrorMessages.UNPROCESSABLE_ENTITY);
    }

    admin.password = password;
    admin.passwordToken = null;

    await admin.save();

    return ctx.created({ admin });
};

const changePassword = async ctx => {
    const { oldPassword, newPassword } = ctx.request.body;
    const { id } = ctx.state.user;

    if (!oldPassword || !newPassword) {
        return ctx.badRequest(ErrorMessages.CHANGE_PASSWORD);
    }

    const admin = await Admin.findByPk(id);

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_ADMIN);
    } else if (!(await admin.comparePassword(oldPassword, admin.password))) {
        return ctx.badRequest(ErrorMessages.INVALID_OLD_PASSWORD);
    }

    admin.password = newPassword;

    await admin.save();

    return ctx.created({ admin });
};

const remove = async ctx => {
    const { id } = ctx.state.user;

    const admin = await Admin.findByPk(id);

    if (!admin) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    if (admin.avatar) {
        await Cloudinary.delete(admin.avatarPublicId);
    }

    await admin.destroy();

    return ctx.noContent();
};

module.exports = {
    login,
    remove,
    create,
    update,
    findAll,
    findOne,
    statistics,
    uploadAvatar,
    resetPassword,
    changePassword,
    forgotPassword
};
