const Router = require('koa-router');

const UserController = require('../controller/UserController');
const { auth, getAvatar } = require('../middleware');

const router = new Router({
  prefix: '/users',
});

router.get('/', auth, UserController.findAll);
router.get('/:id', auth, UserController.findOne);

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/avatar', auth, getAvatar, UserController.uploadAvatar);

router.delete('/:id', auth, UserController.remove);

module.exports = router;
