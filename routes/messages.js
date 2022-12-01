const Router = require('koa-router');

const MessageController = require('../controller/MessageController');
const auth = require('../middleware/auth');

const router = new Router({ prefix: '/messages' });

router.post('/:threadId/:profileId', auth, MessageController.create);

module.exports = router;
