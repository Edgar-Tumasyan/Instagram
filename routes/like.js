const Router = require('koa-router');

const LikeController = require('../controller/LikeController');
const { auth } = require('../middleware');

const router = new Router({
  prefix: '/likes',
});

router.post('/:postId', auth, LikeController.likePost);

router.delete('/:postId', auth, LikeController.dislike);

module.exports = router;
