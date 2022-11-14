const Router = require('koa-router');

const {
  create,
  findAll,
  findOne,
  update,
  remove,
} = require('../controller/PostController');

const { auth, getAttachment } = require('../middleware');

const router = new Router({
  prefix: '/posts',
});

router.get('/', auth, findAll);
router.get('/:id', auth, findOne);

router.post('/', auth, getAttachment, create);

router.put('/:id', auth, update);

router.delete('/:id', auth, remove);

module.exports = router;
