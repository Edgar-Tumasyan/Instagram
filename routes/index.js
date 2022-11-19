const Router = require('koa-router');

const userRoutes = require('./user');
const postRoutes = require('./post');
const userFollowRoutes = require('./userFollow');
const likeRoutes = require('./like');

const router = new Router({
  prefix: '/api/v1',
});

router.use(userRoutes.routes());
router.use(postRoutes.routes());
router.use(userFollowRoutes.routes());
router.use(likeRoutes.routes());

module.exports = router;
