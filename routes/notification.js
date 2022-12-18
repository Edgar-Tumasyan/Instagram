const Router = require('koa-router');

const auth = require('../middlewares/auth');
const NotificationController = require('../controllers/NotificationController');

const router = new Router({ prefix: '/notifications' });

router.get('/', auth, NotificationController.findAll);

module.exports = router;
