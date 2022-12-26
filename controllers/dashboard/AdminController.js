const ErrorMessages = require('../../constants/ErrorMessages');
const { Admin, User, Post } = require('../../data/models');
const Helpers = require('../../components/Helpers');

const homePage = async ctx => {
    const currentYear = new Date().getFullYear();
    const lastYear = new Date().getFullYear() - 1;

    const currentYearUsers = await User.scope({ method: ['homePage', currentYear] }).findAll({ raw: true });

    const lastYearUsers = await User.scope({ method: ['homePage', lastYear] }).findAll({ raw: true });

    const currentYearPosts = await Post.scope({ method: ['homePage', currentYear] }).findAll({ raw: true });

    const lastYearPosts = await Post.scope({ method: ['homePage', lastYear] }).findAll({ raw: true });

    const users = await Helpers.homePageNormalizer(currentYearUsers, lastYearUsers);

    const posts = await Helpers.homePageNormalizer(currentYearPosts, lastYearPosts);

    return ctx.ok({ users, posts });
};

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

module.exports = { login, create, homePage };

// Select months, month, py  from month
// LEFT OUTER JOIN (
//   Select to_char("createdAt", 'Mon') as name, Count(*) as month from "user"
// where extract(Year from "createdAt") = 2022
// group by name) users on month.months = users.name
// LEFT OUTER JOIN
// (Select to_char("createdAt", 'Mon') as nam, Count(*) as PY from "user"
// where extract(Year from "createdAt") = 2021
// group by nam) userss on month.months = userss.nam
