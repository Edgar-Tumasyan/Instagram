const respond = require('koa-respond');
const compose = require('koa-compose');

const errorHandler = require('./errorHandler');
const pagination = require('./pagination');

module.exports = () =>
  compose([
    respond({
      statusMethods: {
        unprocessable_entity: 422,
      },
    }),
    errorHandler(),
    pagination(),
  ]);
