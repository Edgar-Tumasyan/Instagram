const Router = require('koa-router');

const userFollowRoutes = require('./follow');
const messageRoutes = require('./messages');
const threadRoutes = require('./thread');
const userRoutes = require('./user');
const postRoutes = require('./post');
const likeRoutes = require('./like');

const router = new Router({ prefix: '/api/v1' });

router.use(userFollowRoutes.routes());
router.use(messageRoutes.routes());
router.use(threadRoutes.routes());
router.use(userRoutes.routes());
router.use(postRoutes.routes());
router.use(likeRoutes.routes());

module.exports = router;
