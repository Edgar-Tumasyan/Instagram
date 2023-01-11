const Router = require('koa-router');

const ThreadHandler = require('../handlers/ThreadHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/threads' });

router.get('/', auth, ThreadHandler.findAll);
router.get('/:threadId', auth, ThreadHandler.findOne);

router.post('/', auth, ThreadHandler.create);

router.delete('/:threadId', auth, ThreadHandler.remove);

module.exports = router;
