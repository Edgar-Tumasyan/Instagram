module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'likesCount', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('posts', 'likesCount');
  },
};
