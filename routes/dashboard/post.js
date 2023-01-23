const Router = require('koa-router');

const PostHandler = require('../../handlers/dashboard/PostHandler');
const { auth, acl } = require('../../middlewares');
const { UserRole } = require('../../data/lcp');

const router = new Router({ prefix: '/posts' });

router.get('/', auth, acl([UserRole.ADMIN]), PostHandler.findAll);

router.post('/export', auth, acl([UserRole.ADMIN]), PostHandler.exportData);

router.delete('/:id', auth, acl([UserRole.ADMIN]), PostHandler.remove);

module.exports = router;
