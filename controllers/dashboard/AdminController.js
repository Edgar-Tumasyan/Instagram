const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin, User, Post } = require('../../data/models');
const Helpers = require('../../components/Helpers');

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

module.exports = { login, create, homePage };
