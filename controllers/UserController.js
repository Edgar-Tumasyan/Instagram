const _ = require('lodash');
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
    const { id: profileId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const user = await User.scope({ method: ['profile', profileId, userId] }).findByPk(profileId);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + ` ${profileId}`);
    }

    return ctx.ok({ user });
};

const create = async ctx => {
    const { firstname, lastname, email, password } = ctx.request.body;

    const newUser = await User.create({ firstname, lastname, email, password });

    return ctx.created({ user: newUser });
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

const uploadAvatar = async ctx => {
    const reqAvatar = ctx.request.files?.avatar;

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

    const { id } = ctx.state.user;

    await User.update({ avatar: avatar.secure_url, avatarPublicId: avatar.public_id }, { where: { id } });

    const user = await User.scope({ method: ['yourProfile'] }).findByPk(id, { raw: true });

    return ctx.created({ user });
};

const changeProfileCategory = async ctx => {
    const { profileCategory } = ctx.request.body;

    if (!profileCategory) {
        return ctx.badRequest(ErrorMessages.PROFILE_CATEGORY);
    }

    const { id } = ctx.state.user;

    await User.update({ profileCategory }, { where: { id } });

    const user = await User.findByPk(id);

    return ctx.ok({ user });
};

const remove = async ctx => {
    const { id } = ctx.state.user;

    const user = await User.findByPk(id, { raw: true });

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + ` ${id}`);
    }

    if (user.avatar) {
        await Cloudinary.delete(user.avatarPublicId);
    }

    await User.destroy({ where: { id } });

    return ctx.noContent();
};

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

module.exports = {
    login,
    create,
    remove,
    findAll,
    findOne,
    uploadAvatar,
    resetPassword,
    forgotPassword,
    changePassword,
    changeProfileCategory
};
