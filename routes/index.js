const Router = require('koa-router');

const userRoutes = require('./user');

const router = new Router({
    prefix: '/api/v1'
});

router.use(userRoutes.routes());

module.exports = router;
