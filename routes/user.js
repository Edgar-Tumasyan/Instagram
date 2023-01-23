const Router = require('koa-router');

const UserHandler = require('../handlers/UserHandler');
const { auth } = require('../middlewares');

const router = new Router({ prefix: '/users' });

router.get('/', auth, UserHandler.findAll);
router.get('/:id', auth, UserHandler.findOne);

router.post('/', UserHandler.create);
router.post('/login', UserHandler.login);

router.put('/', auth, UserHandler.update);
router.put('/avatar', auth, UserHandler.uploadAvatar);
router.put('/reset-password', UserHandler.resetPassword);
router.put('/forgot-password', UserHandler.forgotPassword);
router.put('/change-password', auth, UserHandler.changePassword);
router.put('/change-profile-category', auth, UserHandler.changeProfileCategory);

router.delete('/', auth, UserHandler.remove);

module.exports = router;
