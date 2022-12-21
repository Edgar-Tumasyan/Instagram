const Router = require('koa-router');

const UserController = require('../../controllers/dashboard/UserController');
const { auth, acl } = require('../../middlewares');

const router = new Router({ prefix: '/users' });

router.get('/', auth, acl(['admin']), UserController.findAll);

router.post('/:id', auth, acl(['admin']), UserController.activateUser);

router.delete('/:id', auth, acl(['admin']), UserController.deactivateUser);

module.exports = router;
