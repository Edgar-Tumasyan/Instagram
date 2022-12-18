const Router = require('koa-router');

const auth = require('../middlewares/auth');
const LikeController = require('../controllers/LikeController');

const router = new Router({ prefix: '/posts/:postId/likes' });

router.get('/users', auth, LikeController.postLikesUsers);

router.post('/', auth, LikeController.create);

router.delete('/', auth, LikeController.remove);

module.exports = router;
