const Router = require('koa-router');

const AdminController = require('../../controllers/dashboard/AdminController');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/admin' });

router.get('/', auth, acl([UserRole.ADMIN]), AdminController.homePage);

router.post('/login', AdminController.login);
router.post('/', auth, acl([UserRole.ADMIN]), AdminController.create);

module.exports = router;
