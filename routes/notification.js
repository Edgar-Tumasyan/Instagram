const Router = require('koa-router');

const NotificationHandler = require('../handlers/NotificationHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/notifications' });

router.get('/', auth, NotificationHandler.findAll);

module.exports = router;
