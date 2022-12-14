const Router = require('koa-router');

const UserController = require('../../controller/dashboard/UserController');
const { auth, authtorizePermissions } = require('../../middleware');

const router = new Router({ prefix: '/users' });

router.get('/', auth, authtorizePermissions, UserController.findAll);

module.exports = router;
