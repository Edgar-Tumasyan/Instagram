const Router = require('koa-router');

const ThreadHandler = require('../handlers/ThreadHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/threads' });

router.get('/', auth, ThreadHandler.findAll);

router.post('/', auth, ThreadHandler.create);

module.exports = router;
