module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('threadUser', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            threadId: { type: Sequelize.UUID, allowNull: false, references: { model: 'thread', key: 'id' }, onDelete: 'Cascade' },
            userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('threadUser');
    }
};
