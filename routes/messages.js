const Router = require('koa-router');

const MessageHandler = require('../handlers/MessageHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/messages' });

router.post('/:threadId/:profileId', auth, MessageHandler.create);

module.exports = router;
