const Router = require('koa-router');

const UserFollowController = require('../controller/UserFollowController');
const { auth } = require('../middleware');

const router = new Router({
  prefix: '/users',
});

router.post('/follow/:profileId', auth, UserFollowController.follow);
router.delete('/unfollow/:profileId', auth, UserFollowController.unfollow);

module.exports = router;
