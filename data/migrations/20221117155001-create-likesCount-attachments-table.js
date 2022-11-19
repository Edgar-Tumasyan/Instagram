module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('attachments', 'likesCount', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('attachments', 'likesCount');
  },
};
