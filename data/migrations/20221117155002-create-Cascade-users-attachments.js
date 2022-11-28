module.exports = {
    async up(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeConstraint('attachments', 'attachments_userId_fkey', {
                transaction
            });
            await queryInterface.addConstraint('attachments', {
                type: 'foreign key',
                name: 'attachments_userId_fkey',
                fields: ['userId'],
                references: {
                    table: 'users',
                    field: 'id'
                },
                onDelete: 'CASCADE',
                transaction
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
            await queryInterface.removeConstraint('attachments', 'attachments_userId_fkey', {
                transaction
            });
            await queryInterface.addConstraint('attachments', {
                type: 'foreign key',
                name: 'attachments_userId_fkey',
                fields: ['userId'],
                references: {
                    table: 'users',
                    field: 'id'
                },
                transaction
            });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
