const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = async token => jwt.verify(token, config.JWT_SECRET);

module.exports = verifyToken;
