const Router = require('koa-router');

const AdminController = require('../../controller/dashboard/AdminController');

const router = new Router({ prefix: '/admin' });

router.post('/', AdminController.create);
router.post('/login', AdminController.login);

module.exports = router;
