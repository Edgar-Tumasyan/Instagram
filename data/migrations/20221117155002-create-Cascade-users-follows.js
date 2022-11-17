module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'follows',
        'follows_followerId_fkey',
        {
          transaction,
        }
      );
      await queryInterface.addConstraint('follows', {
        type: 'foreign key',
        name: 'follows_followerId_fkey',
        fields: ['followingId'],
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction,
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'follows',
        'follows_followerId_fkey',
        {
          transaction,
        }
      );
      await queryInterface.addConstraint('follows', {
        type: 'foreign key',
        name: 'follows_followerId_fkey',
        fields: ['followingId'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
