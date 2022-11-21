const Router = require('koa-router');

const LikeController = require('../controller/LikeController');
const { auth } = require('../middleware');

const router = new Router({
  prefix: '/posts/:postId/likes',
});

router.post('/', auth, LikeController.create);

router.delete('/', auth, LikeController.remove);

module.exports = router;
