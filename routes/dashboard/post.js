const Router = require('koa-router');

const PostController = require('../../controllers/dashboard/PostController');
const { auth, authorizePermissions, adminPostRequestNormalizer } = require('../../middlewares');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, authorizePermissions, adminPostRequestNormalizer, PostController.findAll);

module.exports = router;
