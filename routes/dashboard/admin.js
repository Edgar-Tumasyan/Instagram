const Router = require('koa-router');

const AdminController = require('../../controllers/dashboard/AdminController');
const { auth, acl } = require('../../middlewares');

const router = new Router({ prefix: '/admin' });

router.post('/login', AdminController.login);
router.post('/', auth, acl(['admin']), AdminController.create);

module.exports = router;
