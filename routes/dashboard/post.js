const Router = require('koa-router');

const PostController = require('../../controllers/dashboard/PostController');
const { auth, authorizePermissions, adminRequestNormalizer } = require('../../middlewares');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, authorizePermissions, adminRequestNormalizer, PostController.findAll);

module.exports = router;
