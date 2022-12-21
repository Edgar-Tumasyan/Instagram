const Router = require('koa-router');

const PostController = require('../../controllers/dashboard/PostController');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, acl([UserRole.ADMIN]), PostController.findAll);

module.exports = router;
