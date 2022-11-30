const Router = require('koa-router');

const MessageController = require('../controller/MessageController');
const auth = require('../middleware/auth');

const router = new Router({ prefix: '/thread' });

router.post('/:userId', auth, MessageController.sendMessage);

module.exports = router;
