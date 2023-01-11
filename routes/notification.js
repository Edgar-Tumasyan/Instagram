const Router = require('koa-router');

const NotificationHandler = require('../handlers/NotificationHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/notifications' });

router.get('/', auth, NotificationHandler.findAll);

router.put('/', auth, NotificationHandler.allRead);

router.put('/read/:id', auth, NotificationHandler.read);
router.put('/unread/:id', auth, NotificationHandler.unread);

router.delete('/:id', auth, NotificationHandler.remove);

module.exports = router;
