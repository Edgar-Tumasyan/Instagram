const Router = require('koa-router');

const FollowHandler = require('../handlers/FollowHandler');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/users' });

router.get('/:profileId/followers', auth, FollowHandler.getUserFollowers);
router.get('/:profileId/followings', auth, FollowHandler.getUserFollowings);

router.post('/:profileId/follow', auth, FollowHandler.create);

router.put('/follow-request/:followerId', auth, FollowHandler.acceptFollowInvitation);

router.delete('/:profileId/unfollow', auth, FollowHandler.remove);
router.delete('/:profileId/follow-request', auth, FollowHandler.cancelFollowInvitation);
router.delete('/follow-request/:followerId', auth, FollowHandler.declineFollowInvitation);

module.exports = router;
