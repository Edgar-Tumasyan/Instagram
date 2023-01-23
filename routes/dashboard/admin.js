const Router = require('koa-router');

const AdminHandler = require('../../handlers/dashboard/AdminHandler');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/admins' });

router.get('/', auth, acl([UserRole.ADMIN]), AdminHandler.findAll);
router.get('/:id', auth, acl([UserRole.ADMIN]), AdminHandler.findOne);
router.get('/statistics', auth, acl([UserRole.ADMIN]), AdminHandler.statistics);

router.post('/login', AdminHandler.login);
router.post('/', auth, acl([UserRole.ADMIN]), AdminHandler.create);

router.put('/reset-password', AdminHandler.resetPassword);
router.put('/forgot-password', AdminHandler.forgotPassword);
router.put('/', auth, acl([UserRole.ADMIN]), AdminHandler.update);
router.put('/avatar', auth, acl([UserRole.ADMIN]), AdminHandler.uploadAvatar);
router.put('/change-password', auth, acl([UserRole.ADMIN]), AdminHandler.changePassword);

router.delete('/', auth, acl([UserRole.ADMIN]), AdminHandler.remove);

module.exports = router;
