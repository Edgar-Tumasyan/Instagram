const Router = require('koa-router');

const NotificationController = require('../controllers/NotificationController');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/notifications' });

router.get('/', auth, NotificationController.findAll);

module.exports = router;
