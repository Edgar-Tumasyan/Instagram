const Router = require('koa-router');

const UserController = require('../controller/UserController');
const { auth } = require('../middleware');

const router = new Router({
  prefix: '/users',
});

router.get('/', auth, UserController.findAll);
router.get('/:id', auth, UserController.findOne);
router.get('/likes/:postId', auth, UserController.postLikesUsers)

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/avatar', auth, UserController.uploadAvatar);


router.delete('/', auth, UserController.remove);

module.exports = router;
