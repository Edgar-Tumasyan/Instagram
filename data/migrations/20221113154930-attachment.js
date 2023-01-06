module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attachment', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            postId: { type: Sequelize.UUID, references: { model: 'post', key: 'id' }, onDelete: 'Cascade' },
            userId: { type: Sequelize.UUID, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            attachmentUrl: { type: Sequelize.STRING, allowNull: false },
            attachmentPublicId: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('attachment');
    }
};
