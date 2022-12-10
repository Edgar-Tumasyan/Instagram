const Router = require('koa-router');

const UserController = require('../controller/UserController');
const { auth, authtorizePermissions } = require('../middleware');

const router = new Router({ prefix: '/users' });

router.get('/', auth, authtorizePermissions, UserController.findAll);
router.get('/:id', auth, UserController.findOne);

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/avatar', auth, UserController.uploadAvatar);
router.post('/change-profile-category', auth, UserController.changeProfileCategory);

router.delete('/', auth, UserController.remove);

module.exports = router;
