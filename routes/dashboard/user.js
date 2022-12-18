const Router = require('koa-router');

const { auth, authorizePermissions } = require('../../middlewares');
const UserController = require('../../controllers/dashboard/UserController');

const router = new Router({ prefix: '/users' });

router.get('/', auth, authorizePermissions, UserController.findAll);

router.post('/:id', auth, authorizePermissions, UserController.activateUser);

router.delete('/:id', auth, authorizePermissions, UserController.deactivateUser);

module.exports = router;
