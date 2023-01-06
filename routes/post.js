const Router = require('koa-router');

const PostHandler = require('../handlers/PostHandler');
const { auth } = require('../middlewares');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, PostHandler.findAll);
router.get('/main', auth, PostHandler.main);
router.get('/:id', auth, PostHandler.findOne);
router.get('/profile/:profileId', auth, PostHandler.getUserPosts);

router.post('/', auth, PostHandler.create);

router.put('/:id', auth, PostHandler.update);

router.delete('/:id', auth, PostHandler.remove);

module.exports = router;
