const Router = require('koa-router');

const { auth, authorizePermissions } = require('../../middlewares');
const AdminController = require('../../controllers/dashboard/AdminController');

const router = new Router({ prefix: '/admin' });

router.post('/login', AdminController.login);
router.post('/', auth, authorizePermissions, AdminController.create);

module.exports = router;
