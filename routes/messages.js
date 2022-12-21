const Router = require('koa-router');

const MessageController = require('../controllers/MessageController');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/messages' });

router.post('/:threadId/:profileId', auth, MessageController.create);

module.exports = router;
