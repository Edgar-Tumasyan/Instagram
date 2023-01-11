const Router = require('koa-router');

const MessageHandler = require('../handlers/MessageHandler');
const auth = require('../middlewares/auth');
const { ro } = require('@faker-js/faker/lib/locales');

const router = new Router({ prefix: '/messages' });

router.get('/:threadId', auth, MessageHandler.findAll);

router.post('/:threadId', auth, MessageHandler.create);

router.put('/:threadId/:messageId', auth, MessageHandler.update);

router.delete('/:threadId/:messageId', auth, MessageHandler.remove);

module.exports = router;
