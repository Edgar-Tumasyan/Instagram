const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const StatusCodes = require('http-status-codes')

const userCreate = async (ctx) => {
  const {username, email, password} = ctx.request.body

  if(!username || !email || !password) {
    ctx.status = StatusCodes.BAD_REQUEST
    return  ctx.body = 'Please provide all values'
  };

  const existingEmail = await  User.findOne({where: {email}});

  if(existingEmail) {
    ctx.status = StatusCodes.BAD_REQUEST
    return ctx.body = `Email ${email} already exist`
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const newUser = await  User.create({username, email, password: hashPassword})

  const token = jwt.sign({id:newUser.id, username: newUser.username,
    role: newUser.role}, process.env.JWT_SECRET, {expiresIn: '1d'} );

  const {password: userPassword, ...data} =  newUser.dataValues

  ctx.status = StatusCodes.CREATED
  ctx.body = {data, token}
}

const getAllUsers = async (ctx) => {
  const users = await User.findAll()
  const count = users.length

  ctx.status = StatusCodes.OK
  ctx.body = {count, users}
}

const getUser = async (ctx) => {
const user = await  User.findByPk(ctx.request.params.id)

  if(!user) {
    ctx.status = StatusCodes.BAD_REQUEST
    return ctx.body = `No user with id ${ctx.request.params.id}`
  }

  const {password, ...data} = user.dataValues

  ctx.status = StatusCodes.OK
  ctx.body = { data }
}

const deleteUser = async (ctx) => {
  const user = await  User.findByPk(ctx.request.params.id)

  if(!user) {
    ctx.status = StatusCodes.BAD_REQUEST
    return ctx.body = `No user with id ${ctx.request.params.id}`
  }

  await User.destroy({where: {id: ctx.request.params.id}})

  ctx.status = StatusCodes.OK
  ctx.body = {message: 'User deleted'}
}



module.exports = {userCreate, getAllUsers, getUser, deleteUser}