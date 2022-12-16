const respond = require('koa-respond');
const compose = require('koa-compose');

const pagination = require('./pagination');
const errorHandler = require('./errorHandler');

module.exports = () => compose([respond({ statusMethods: { unprocessable_entity: 422 } }), errorHandler(), pagination()]);
