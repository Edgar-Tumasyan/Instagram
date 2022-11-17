const Router = require('koa-router');

const PostController = require('../controller/PostController');

const {
  auth,
  getAttachment,
  getNewAttachments,
  checkLimitAndOffset,
} = require('../middleware');

const router = new Router({
  prefix: '/posts',
});

router.get('/', auth, checkLimitAndOffset, PostController.findAll);
router.get('/:id', auth, PostController.findOne);

router.post('/', auth, getAttachment, PostController.create);

router.put('/:id', auth, getNewAttachments, PostController.update);

router.delete('/:id', auth, PostController.remove);

module.exports = router;
