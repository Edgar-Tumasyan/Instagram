const _ = require('lodash');
const { ProfileCategory } = require('../lcp');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'profileCategory', {
      type: Sequelize.DataTypes.ENUM,
      values: _.values(ProfileCategory),
      defaultValue: ProfileCategory.PUBLIC,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'profileCategory');
  },
};
