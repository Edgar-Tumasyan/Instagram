const Router = require('koa-router');

const auth = require('../middlewares/auth');
const MessageController = require('../controllers/MessageController');

const router = new Router({ prefix: '/messages' });

router.post('/:threadId/:profileId', auth, MessageController.create);

module.exports = router;
