const respond = require('koa-respond');
const compose = require('koa-compose');

const { errorHandler, checkLimitAndOffset } = require('./index');

module.exports = () =>
  compose([
    respond({
      statusMethods: {
        unprocessable_entity: 422,
      },
    }),
    errorHandler(),
    checkLimitAndOffset(),
  ]);
