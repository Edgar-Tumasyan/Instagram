const Router = require('koa-router');

const userRoutes = require('./user');
const postRoutes = require('./post');
const UserFollowRoutes = require('./userFollow');

const router = new Router({
  prefix: '/api/v1',
});

router.use(userRoutes.routes());
router.use(postRoutes.routes());
router.use(UserFollowRoutes.routes());

module.exports = router;
