const Router = require('koa-router');

const PostController = require('../../controllers/dashboard/PostController');
const { auth, acl } = require('../../middlewares');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, acl(['admin']), PostController.findAll);

module.exports = router;
