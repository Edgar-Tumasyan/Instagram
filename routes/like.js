const Router = require('koa-router');

const LikeHandler = require('../handlers/LikeHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/posts/:postId/likes' });

router.get('/users', auth, LikeHandler.postLikesUsers);

router.post('/', auth, LikeHandler.create);

router.delete('/', auth, LikeHandler.remove);

module.exports = router;
