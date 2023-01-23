module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('post', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            title: { type: Sequelize.STRING, allowNull: false },
            userId: { type: Sequelize.UUID, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('post');
    }
};
