const _ = require('lodash');
const { literal } = require('sequelize');

const { User, generateSearchQuery } = require('../data/models');
const ErrorMessages = require('../constants/ErrorMessages');
const { FilterParam, SortParam } = require('../constants');
const Cloudinary = require('../components/Cloudinary');
const avatarType = require('../constants/ImageType');

const findAll = async ctx => {
    const { q, sortType, sortField, status, profileCategory } = ctx.query;
    const { limit, offset, pagination } = ctx.state.paginate;
    const { id: userId } = ctx.state.user;

    const filter = { status, profileCategory };

    const sortKey = SortParam.USER[sortField] ? SortParam.USER[sortField] : SortParam.USER.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, FilterParam.USER) : {};

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

    if (!avatarType.includes(reqAvatar.ext)) {
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

module.exports = {
    login,
    create,
    remove,
    findAll,
    findOne,
    uploadAvatar,
    changeProfileCategory
};
