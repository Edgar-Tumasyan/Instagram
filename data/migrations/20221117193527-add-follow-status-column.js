const _ = require('lodash');
const { FollowStatus } = require('../lcp');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('follows', 'status', {
      type: Sequelize.DataTypes.ENUM,
      values: _.values(FollowStatus),
      defaultValue: FollowStatus.APPROVED,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('follows', 'status');
  },
};
