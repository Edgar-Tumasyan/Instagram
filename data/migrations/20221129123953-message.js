module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('message', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            text: { type: Sequelize.TEXT, allowNull: false },
            userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'user', key: 'id' } },
            threadId: { type: Sequelize.UUID, allowNull: false, references: { model: 'thread', key: 'id' } },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });

        await queryInterface.addColumn('thread', 'lastMessageId', {
            type: Sequelize.UUID,
            references: { model: 'message', key: 'id' },
            onDelete: 'Cascade'
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn('thread', 'lastMessageId');

        await queryInterface.dropTable('message');
    }
};
