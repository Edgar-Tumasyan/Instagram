const Router = require('koa-router');

const UserController = require('../../controllers/dashboard/UserController');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/users' });

router.get('/', auth, acl([UserRole.ADMIN]), UserController.findAll);

router.post('/export', auth, acl([UserRole.ADMIN]), UserController.exportData);
router.post('/activate/:id', auth, acl([UserRole.ADMIN]), UserController.activateUser);

router.delete('/deactivate/:id', auth, acl([UserRole.ADMIN]), UserController.deactivateUser);

module.exports = router;
