const _ = require('lodash');
const validator = require('validator');
const { literal } = require('sequelize');

const { SearchParam, SortParam, ErrorMessages, ImageType } = require('../constants');
const { Cloudinary, SendEmail, Helpers } = require('../components');
const { User, generateSearchQuery } = require('../data/models');
const config = require('../config');

const findAll = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;
    const { id: userId } = ctx.state.user;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const { rows: users, count: total } = await User.scope({ method: ['profiles', userId, filter] }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ users, _meta: pagination(total) });
};

const findOne = async ctx => {
    let { id: profileId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    if (profileId === 'me') {
        profileId = userId;
    }

    const user = await User.scope({ method: ['profile', profileId, userId] }).findByPk(profileId);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    return ctx.ok({ user });
};

const create = async ctx => {
    const { firstname, lastname, email, password } = ctx.request.body;

    const user = await User.create({ firstname, lastname, email, password });

    return ctx.created({ user });
};

const login = async ctx => {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password, user.password))) {
        return ctx.notFound(ErrorMessages.INVALID_CREDENTIALS);
    }

    return ctx.ok({ user, token: user.generateToken() });
};

const update = async ctx => {
    const { firstname, lastname, email } = ctx.request.body;
    const { id } = ctx.state.user;

    if (!firstname && !lastname && !email) {
        return ctx.badRequest(ErrorMessages.UPDATED_VALUES);
    }

    const user = await User.scope({ method: ['yourProfile'] }).findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    if (firstname) {
        user.firstname = firstname;
    }

    if (lastname) {
        user.lastname = lastname;
    }

    if (email) {
        user.email = email;
    }

    await user.save();

    return ctx.ok({ user });
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

    await User.update({ avatar: avatar.secure_url, avatarPublicId: avatar.public_id }, { where: { id } });

    const user = await User.scope({ method: ['yourProfile'] }).findByPk(id);

    return ctx.created({ user });
};

const changeProfileCategory = async ctx => {
    const { profileCategory } = ctx.request.body;
    const { id } = ctx.state.user;

    if (!profileCategory) {
        return ctx.badRequest(ErrorMessages.PROFILE_CATEGORY);
    }

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    user.profileCategory = profileCategory;

    await user.save();

    return ctx.ok({ user });
};

const forgotPassword = async ctx => {
    const { email } = ctx.request.body;

    if (!email || !validator.isEmail(email)) {
        return ctx.badRequest(ErrorMessages.FORGOT_PASSWORD_EMAIL);
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    const passwordToken = await Helpers.passwordToken(user);
    const resetUrl = `${config.API_URL}/api/v1/users/reset-password?email=${email}&token=${passwordToken}`;

    await SendEmail(email, config.SENDER_EMAIL, resetUrl, 'Reset Password');

    user.passwordToken = passwordToken;

    await user.save();

    // return resetUrl only for testing in postman
    return ctx.ok({ message: 'Please check your email for reset password link', resetUrl });
};

const resetPassword = async ctx => {
    const { password } = ctx.request.body;
    const { email, token } = ctx.query;

    if (!email || !token || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    if (_.isNull(user.passwordToken) || token !== user.passwordToken) {
        return ctx.badRequest(ErrorMessages.UNPROCESSABLE_ENTITY);
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

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    } else if (!(await user.comparePassword(oldPassword, user.password))) {
        return ctx.badRequest(ErrorMessages.INVALID_OLD_PASSWORD);
    }

    user.password = newPassword;

    await user.save();

    return ctx.created({ user });
};

const remove = async ctx => {
    const { id } = ctx.state.user;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_USER);
    }

    if (user.avatar) {
        await Cloudinary.delete(user.avatarPublicId);
    }

    await user.destroy();

    return ctx.noContent();
};

module.exports = {
    login,
    create,
    remove,
    update,
    findAll,
    findOne,
    uploadAvatar,
    resetPassword,
    forgotPassword,
    changePassword,
    changeProfileCategory
};
