module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'avatarPublicId', {
      type: Sequelize.DataTypes.STRING,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'avatarPublicId');
  },
};
