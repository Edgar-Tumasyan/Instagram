const Router = require('koa-router');

const UserFollowController = require('../controller/UserFollowController');
const { auth, checkLimitAndOffset } = require('../middleware');

const router = new Router({
  prefix: '/users',
});

router.get(
  '/followers/:id',
  auth,
  checkLimitAndOffset,
  UserFollowController.getUserFollowers
);

router.get(
  '/followings/:id',
  auth,
  checkLimitAndOffset,
  UserFollowController.getUserFollowings
);

router.post('/follow/:profileId', auth, UserFollowController.follow);

router.delete('/unfollow/:profileId', auth, UserFollowController.unfollow);

module.exports = router;
