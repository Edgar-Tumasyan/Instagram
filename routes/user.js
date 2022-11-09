const Router = require('koa-router')
const {authenticateUser} = require('../middleware/auth')

const router = new Router({
 prefix: '/users'
});

const {userCreate, getAllUsers, getUser, deleteUser} = require('../controller/user')

 router.post(('/'), userCreate )
 router.get(('/'), authenticateUser,  getAllUsers )
 router.get(('/:id'), authenticateUser, getUser )
 router.delete(('/:id'), authenticateUser, deleteUser )



module.exports = router