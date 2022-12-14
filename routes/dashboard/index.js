const Router = require('koa-router');

const adminRoutes = require('./admin');
const userRoutes = require('./user');

const router = new Router({ prefix: '/dashboard' });

router.use(adminRoutes.routes());
router.use(userRoutes.routes());

module.exports = router;
