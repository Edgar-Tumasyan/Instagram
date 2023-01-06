const Router = require('koa-router');

const UserHandler = require('../../handlers/dashboard/UserHandler');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/users' });

router.get('/', auth, acl([UserRole.ADMIN]), UserHandler.findAll);

router.post('/export', auth, acl([UserRole.ADMIN]), UserHandler.exportData);

router.put('/status/:id', auth, acl([UserRole.ADMIN]), UserHandler.updateUserStatus);

router.delete('/:id', auth, acl([UserRole.ADMIN]), UserHandler.remove);

module.exports = router;
