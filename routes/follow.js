const Router = require('koa-router');

const UserFollowController = require('../controller/UserFollowController');
const auth = require('../middleware/auth');

const router = new Router({
    prefix: '/users'
});

router.get('/:profileId/followers', auth, UserFollowController.getUserFollowers);

router.get('/:profileId/followings', auth, UserFollowController.getUserFollowings);

router.post('/:profileId/follow', auth, UserFollowController.create);
router.post('/follow-request/:followerId', auth, UserFollowController.acceptFollowInvitation);

router.delete('/follow-request/:followerId', auth, UserFollowController.declineFollowInvitation);
router.delete('/:profileId/follow-request', auth, UserFollowController.cancelFollowInvitation);
router.delete('/:profileId/unfollow', auth, UserFollowController.remove);

module.exports = router;
