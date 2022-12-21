const Router = require('koa-router');

const UserController = require('../../controllers/dashboard/UserController');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/users' });

router.get('/', auth, acl([UserRole.ADMIN]), UserController.findAll);

router.post('/:id', auth, acl([UserRole.ADMIN]), UserController.activateUser);

router.delete('/:id', auth, acl([UserRole.ADMIN]), UserController.deactivateUser);

module.exports = router;
