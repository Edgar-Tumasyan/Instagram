const Router = require('koa-router');

const NotificationController = require('../controller/NotificationController');
const auth = require('../middleware/auth');

const router = new Router({ prefix: '/notifications' });

router.get('/', auth, NotificationController.findAll);

module.exports = router;
