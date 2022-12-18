const Router = require('koa-router');

const userRoutes = require('./user');
const postRoutes = require('./post');
const likeRoutes = require('./like');
const threadRoutes = require('./thread');
const messageRoutes = require('./messages');
const userFollowRoutes = require('./follow');
const notificationRoutes = require('./notification');

const router = new Router({ prefix: '/api/v1' });

router.use(userRoutes.routes());
router.use(postRoutes.routes());
router.use(likeRoutes.routes());
router.use(threadRoutes.routes());
router.use(messageRoutes.routes());
router.use(userFollowRoutes.routes());
router.use(notificationRoutes.routes());

module.exports = router;
