const Router = require('koa-router');

const {
  create,
  findAll,
  findOne,
  update,
  remove,
} = require('../controller/PostController');

const { authenticateUser } = require('../middleware/auth');

const router = new Router({
  prefix: '/posts',
});

router.get('/', authenticateUser, findAll);
router.get('/:id', authenticateUser, findOne);

router.post('/', authenticateUser, create);

router.put('/:id', authenticateUser, update);

router.delete('/:id', authenticateUser, remove);

module.exports = router;
