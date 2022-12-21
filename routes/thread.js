const Router = require('koa-router');

const ThreadController = require('../controllers/ThreadController');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/thread' });

router.get('/', auth, ThreadController.findAll);

router.post('/:profileId', auth, ThreadController.create);

module.exports = router;
