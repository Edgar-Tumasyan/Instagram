const ErrorMessages = require('../constants/ErrorMessages');
const Cloudinary = require('../components/Cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User } = require('../data/models');
const config = require('../config');

const findAll = async ctx => {
    const userId = ctx.state.user.id;

    const { limit, offset } = ctx.state.paginate;

    const { rows: users, count: total } = await User.scope({
        method: ['profiles', userId]
    }).findAndCountAll({ offset, limit });

    return ctx.ok({
        users,
        _meta: {
            total,
            currentPage: Math.ceil((offset + 1) / limit) || 1,
            pageCount: Math.ceil(total / limit)
        }
    });
};

const findOne = async ctx => {
    const profileId = ctx.request.params.id;
    const userId = ctx.state.user.id;

    const user = await User.scope({ method: ['profile', profileId, userId] }).findByPk(profileId);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + ` ${profileId}`);
    }

    return ctx.ok({ user });
};

const create = async ctx => {
    const { firstname, lastname, email, password } = ctx.request.body;

    if (!firstname || !lastname || !email || !password) {
        return ctx.badRequest(ErrorMessages.MISSING_VALUES);
    }

    const existingEmail = await User.findOne({ where: { email } });

    if (existingEmail) {
        return ctx.badRequest(ErrorMessages.EXISTING_EMAIL);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ firstname, lastname, email, password: hashPassword });

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

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.JWT_SECRET, {
        expiresIn: config.EXPIRES_IN
    });

    ctx.ok({ user, token });
};

const uploadAvatar = async ctx => {
    const reqAvatar = ctx.request.files?.avatar;

    if (!reqAvatar) {
        return ctx.badRequest(ErrorMessages.MISSING_AVATAR);
    }

    if (_.isArray(reqAvatar)) {
        return ctx.badRequest(ErrorMessages.MANY_AVATARS);
    }

    if (reqAvatar.type !== 'image') {
        return ctx.badRequest(ErrorMessages.AVATAR_TYPE);
    }

    const avatar = await Cloudinary.upload(reqAvatar.path, 'avatars');

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

    ctx.body = { user };
};

const remove = async ctx => {
    const id = ctx.state.user.id;

    const user = await User.findByPk(id);

    if (!user) {
        return ctx.notFound(ErrorMessages.NO_USER + ` ${id}`);
    }

    if (user.avatar) {
        await Cloudinary.delete(user.avatarPublicId);
    }

    await User.destroy({ where: { id } });

    ctx.noContent();
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
