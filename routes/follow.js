const Router = require('koa-router');

const FollowController = require('../controller/FollowController');
const auth = require('../middleware/auth');

const router = new Router({
    prefix: '/users'
});

router.get('/:profileId/followers', auth, FollowController.getUserFollowers);

router.get('/:profileId/followings', auth, FollowController.getUserFollowings);

router.post('/:profileId/follow', auth, FollowController.create);
router.post('/follow-request/:followerId', auth, FollowController.acceptFollowInvitation);

router.delete('/follow-request/:followerId', auth, FollowController.declineFollowInvitation);
router.delete('/:profileId/follow-request', auth, FollowController.cancelFollowInvitation);
router.delete('/:profileId/unfollow', auth, FollowController.remove);

module.exports = router;
