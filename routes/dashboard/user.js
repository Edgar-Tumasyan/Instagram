const Router = require('koa-router');

const UserController = require('../../controllers/dashboard/UserController');
const { auth, authorizePermissions, adminRequestNormalizer } = require('../../middlewares');

const router = new Router({ prefix: '/users' });

router.get('/', auth, authorizePermissions, adminRequestNormalizer, UserController.findAll);

router.post('/:id', auth, authorizePermissions, UserController.activateUser);

router.delete('/:id', auth, authorizePermissions, UserController.deactivateUser);

module.exports = router;
