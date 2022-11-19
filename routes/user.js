const Router = require('koa-router');

const UserController = require('../controller/UserController');
const { auth, getAvatar, checkLimitAndOffset } = require('../middleware');

const router = new Router({
  prefix: '/users',
});

router.get('/', auth, checkLimitAndOffset, UserController.findAll);
router.get('/:id', auth, UserController.findOne);
router.get(
  '/posts/:id',
  auth,
  checkLimitAndOffset,
  UserController.getUserPosts
);

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/avatar', auth, getAvatar, UserController.uploadAvatar);

router.delete('/', auth, UserController.remove);

module.exports = router;
