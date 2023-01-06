module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('like', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            postId: { type: Sequelize.UUID, allowNull: false, references: { model: 'post', key: 'id' }, onDelete: 'Cascade' },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('like');
    }
};
