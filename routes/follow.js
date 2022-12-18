const Router = require('koa-router');

const auth = require('../middlewares/auth');
const FollowController = require('../controllers/FollowController');

const router = new Router({ prefix: '/users' });

router.get('/:profileId/followers', auth, FollowController.getUserFollowers);
router.get('/:profileId/followings', auth, FollowController.getUserFollowings);

router.post('/:profileId/follow', auth, FollowController.create);
router.post('/follow-request/:followerId', auth, FollowController.acceptFollowInvitation);

router.delete('/:profileId/unfollow', auth, FollowController.remove);
router.delete('/:profileId/follow-request', auth, FollowController.cancelFollowInvitation);
router.delete('/follow-request/:followerId', auth, FollowController.declineFollowInvitation);

module.exports = router;
