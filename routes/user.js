const Router = require('koa-router');

const UserController = require('../controllers/UserController');
const { auth } = require('../middlewares');

const router = new Router({ prefix: '/users' });

router.get('/', auth, UserController.findAll);
router.get('/:id', auth, UserController.findOne);

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/avatar', auth, UserController.uploadAvatar);
router.post('/reset-password', auth, UserController.resetPassword);
router.post('/change-password', auth, UserController.changePassword);
router.post('/forgot-password', auth, UserController.forgotPassword);
router.post('/change-profile-category', auth, UserController.changeProfileCategory);

router.delete('/', auth, UserController.remove);

module.exports = router;
