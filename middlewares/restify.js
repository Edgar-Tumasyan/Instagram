const respond = require('koa-respond');
const compose = require('koa-compose');

const { errorHandler, pagination, ordering } = require('./index');

module.exports = () =>
    compose([respond({ statusMethods: { unprocessable_entity: 422 } }), errorHandler(), pagination(), ordering()]);
