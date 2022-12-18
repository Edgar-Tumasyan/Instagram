const _ = require('lodash');
const bcrypt = require('bcrypt');

const { User } = require('../data/models');
const avatarType = require('../constants/imageType');
const Cloudinary = require('../components/Cloudinary');
const ErrorMessages = require('../constants/ErrorMessages');

const findAll = async ctx => {
    const { id: userId } = ctx.state.user;

    const { limit, offset } = ctx.state.paginate;

    const { rows: users, count: total } = await User.scope({ method: ['profiles', userId] }).findAndCountAll({ offset, limit });

    return ctx.ok({
        users,
        _meta: {
            total,
            pageCount: Math.ceil(total / limit),
            currentPage: Math.ceil((offset + 1) / limit) || 1
        }
    });
};

const findOne = async ctx => {
    const { id: userId } = ctx.state.user;
    const { id: profileId } = ctx.request.params;

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

    if (!user || !(await bcrypt.compare(password, user.password))) {
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
    const { id } = ctx.state.user;

    const { profileCategory } = ctx.request.body;

    if (!profileCategory) {
        return ctx.badRequest(ErrorMessages.PROFILE_CATEGORY);
    }

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
