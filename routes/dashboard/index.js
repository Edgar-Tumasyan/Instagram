const Router = require('koa-router');

const userRoutes = require('./user');
const adminRoutes = require('./admin');

const router = new Router({ prefix: '/dashboard' });

router.use(userRoutes.routes());
router.use(adminRoutes.routes());

module.exports = router;
