const Router = require('koa-router');

const { auth } = require('../middlewares');
const PostController = require('../controllers/PostController');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, PostController.findAll);
router.get('/main', auth, PostController.main);
router.get('/:id', auth, PostController.findOne);
router.get('/profile/:profileId', auth, PostController.getUserPosts);

router.post('/', auth, PostController.create);

router.put('/:id', auth, PostController.update);

router.delete('/:id', auth, PostController.remove);

module.exports = router;
