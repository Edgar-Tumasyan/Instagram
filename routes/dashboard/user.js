const Router = require('koa-router');

const UserController = require('../../controllers/dashboard/UserController');
const { auth, authorizePermissions, adminUserRequestNormalizer } = require('../../middlewares');

const router = new Router({ prefix: '/users' });

router.get('/', auth, authorizePermissions, adminUserRequestNormalizer, UserController.findAll);

router.post('/:id', auth, authorizePermissions, UserController.activateUser);

router.delete('/:id', auth, authorizePermissions, UserController.deactivateUser);

module.exports = router;
