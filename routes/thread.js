const Router = require('koa-router');

const auth = require('../middlewares/auth');
const ThreadController = require('../controllers/ThreadController');

const router = new Router({ prefix: '/thread' });

router.get('/', auth, ThreadController.findAll);

router.post('/:profileId', auth, ThreadController.create);

module.exports = router;
